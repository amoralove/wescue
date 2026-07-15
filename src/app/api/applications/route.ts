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
      console.error("Insert error:", error);
      return NextResponse.json(
        { error: error.message ?? "Database error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ application: data }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Application submit error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const { data: existing } = await supabase
      .from("applications")
      .select("id, user_id, status")
      .eq("id", id)
      .single();

    if (!existing) return NextResponse.json({ error: "Application not found" }, { status: 404 });
    if (existing.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (existing.status === "withdrawn") return NextResponse.json({ error: "Already withdrawn" }, { status: 409 });

    const { data, error } = await supabase
      .from("applications")
      .update({ status: "withdrawn" })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ application: data });
  } catch (error) {
    console.error("Withdraw error:", error);
    return NextResponse.json({ error: "Failed to withdraw application" }, { status: 500 });
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
