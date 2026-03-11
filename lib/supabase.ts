import { createClient } from "@supabase/supabase-js";

import { ApplicationRecord } from "@/lib/types";

export function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase server environment variables.");
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });
}

export async function getApplications(): Promise<ApplicationRecord[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("date_applied", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ApplicationRecord[];
}

export async function findDuplicateApplication(company: string, role: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("applications")
    .select("id")
    .ilike("company", company)
    .ilike("role", role)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function insertApplication(record: Omit<ApplicationRecord, "id" | "date_applied">) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("applications")
    .insert(record)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ApplicationRecord;
}
