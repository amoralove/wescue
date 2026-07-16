import { NextRequest, NextResponse } from "next/server";
import { getSystemPrompt, extractPreferences, stripPreferencesTag } from "@/lib/ai";
import { matchDogs } from "@/lib/matching";
import { createClient } from "@/lib/supabase/server";
import type { ChatMessage, Dog } from "@/types";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3.2";

export async function POST(request: NextRequest) {
  try {
    const { messages } = (await request.json()) as { messages: ChatMessage[] };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          { role: "system", content: getSystemPrompt() },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        stream: false,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Ollama error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const assistantText: string = data.message?.content ?? "";

    const preferences = extractPreferences(assistantText);
    const visibleText = stripPreferencesTag(assistantText);

    let matches = null;
    if (preferences) {
      const supabase = await createClient();
      const { data: dogs } = await supabase
        .from("dogs")
        .select("*, shelter:shelters(*)")
        .eq("status", "available")
        .limit(100);

      if (dogs && dogs.length > 0) {
        matches = matchDogs(dogs as Dog[], preferences);
      }
    }

    return NextResponse.json({ message: visibleText, preferences, matches });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 });
  }
}
