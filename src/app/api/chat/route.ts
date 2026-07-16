import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSystemPrompt, extractPreferences, stripPreferencesTag } from "@/lib/ai";
import { matchDogs } from "@/lib/matching";
import { createClient } from "@/lib/supabase/server";
import type { ChatMessage, Dog } from "@/types";

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { messages } = (await request.json()) as { messages: ChatMessage[] };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: getSystemPrompt(),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const assistantText =
      response.content.find((b) => b.type === "text")?.text ?? "";

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
