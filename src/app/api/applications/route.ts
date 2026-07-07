import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dog_id, notes } = await request.json();

    if (!dog_id) {
      return NextResponse.json({ error: "dog_id is required" }, { status: 400 });
    }

    const { data: dog } = await supabase
      .from("dogs")
      .select("id, shelter_id, status, name")
      .eq("id", dog_id)
      .single();

    if (!dog) {
      return NextResponse.json({ error: "Dog not found" }, { status: 404 });
    }

    if (dog.status !== "available") {
      return NextResponse.json(
        { error: "This dog is no longer available for adoption" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("applications")
      .insert({
        user_id: user.id,
        dog_id,
        shelter_id: dog.shelter_id,
        applicant_notes: notes || null,
        status: "submitted",
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "You have already applied to adopt this dog" },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ application: data }, { status: 201 });
  } catch (error) {
    console.error("Application submit error:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("applications")
      .select("*, dog:dogs(*, shelter:shelters(*))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ applications: data ?? [] });
  } catch (error) {
    console.error("Applications fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
