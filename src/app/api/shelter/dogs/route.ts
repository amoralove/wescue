import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getShelterFromUser(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const shelterId: string | undefined = user.user_metadata?.shelter_id;
  if (!shelterId) return null;
  return { user, shelterId };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const ctx = await getShelterFromUser(supabase);
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, ...rest } = body;

    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

    const { data, error } = await supabase
      .from("dogs")
      .insert({ ...rest, name, shelter_id: ctx.shelterId, status: "available", source: "manual" })
      .select()
      .single();

    if (error) {
      console.error("Dog insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ dog: data }, { status: 201 });
  } catch (err) {
    console.error("Add dog error:", err);
    return NextResponse.json({ error: "Failed to add dog" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const ctx = await getShelterFromUser(supabase);
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, ...updates } = await request.json();
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const { data: dog } = await supabase.from("dogs").select("shelter_id").eq("id", id).single();
    if (!dog || dog.shelter_id !== ctx.shelterId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase.from("dogs").update(updates).eq("id", id).select().single();
    if (error) throw error;

    return NextResponse.json({ dog: data });
  } catch (err) {
    console.error("Update dog error:", err);
    return NextResponse.json({ error: "Failed to update dog" }, { status: 500 });
  }
}
