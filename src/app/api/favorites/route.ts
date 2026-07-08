import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { dog_id } = await request.json();
  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: user.id, dog_id });

  if (error && error.code !== "23505") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { dog_id } = await request.json();
  await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("dog_id", dog_id);

  return NextResponse.json({ ok: true });
}
