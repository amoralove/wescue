import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendStatusUpdateEmail } from "@/lib/email";

const VALID_TRANSITIONS: Record<string, string[]> = {
  submitted: ["reviewing", "more_info", "declined"],
  reviewing: ["approved", "more_info", "declined"],
  more_info: ["approved", "declined"],
};

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const shelterId: string | undefined = user.user_metadata?.shelter_id;
    if (!shelterId) return NextResponse.json({ error: "Not a shelter account" }, { status: 403 });

    const { id, status, shelter_notes } = await request.json();
    if (!id || !status) return NextResponse.json({ error: "id and status are required" }, { status: 400 });

    const { data: existing } = await supabase
      .from("applications")
      .select("id, shelter_id, status, user_id")
      .eq("id", id)
      .single();

    if (!existing) return NextResponse.json({ error: "Application not found" }, { status: 404 });
    if (existing.shelter_id !== shelterId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const allowed = VALID_TRANSITIONS[existing.status] ?? [];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: `Cannot transition from ${existing.status} to ${status}` }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("applications")
      .update({ status, shelter_notes: shelter_notes ?? null })
      .eq("id", id)
      .select("*, dog:dogs(name)")
      .single();

    if (error) throw error;

    // Send email to adopter (non-fatal)
    try {
      const { data: adopter } = await supabase.auth.admin.getUserById(existing.user_id);
      if (adopter.user?.email) {
        await sendStatusUpdateEmail({
          to: adopter.user.email,
          dogName: (data.dog as { name: string } | null)?.name ?? "your dog",
          newStatus: status,
          shelterNote: shelter_notes,
        });
      }
    } catch {
      // Auth admin may not be available in client context — skip email silently
    }

    return NextResponse.json({ application: data });
  } catch (err) {
    console.error("Application update error:", err);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}
