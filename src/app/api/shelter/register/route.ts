import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, email, phone, city, state, website, description } = await request.json();
    if (!name || !city || !state) {
      return NextResponse.json({ error: "name, city, and state are required" }, { status: 400 });
    }

    const { data: shelter, error } = await supabase
      .from("shelters")
      .insert({ name, email: email ?? user.email, phone, city, state, website, description, verified: false })
      .select()
      .single();

    if (error) {
      console.error("Shelter insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Store shelter_id in user metadata so we can load the portal
    await supabase.auth.updateUser({ data: { shelter_id: shelter.id, role: "shelter" } });

    return NextResponse.json({ shelter }, { status: 201 });
  } catch (err) {
    console.error("Shelter register error:", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
