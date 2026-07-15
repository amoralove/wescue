import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireShelterAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/shelter/login");

  const shelterId: string | undefined = user.user_metadata?.shelter_id;
  if (!shelterId) redirect("/shelter/login");

  const { data: shelter } = await supabase
    .from("shelters")
    .select("*")
    .eq("id", shelterId)
    .single();

  if (!shelter) redirect("/shelter/login");

  return { user, shelter, supabase };
}
