import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("testing")
      .select("*")
      .limit(5);

    if (error) throw error;

    return NextResponse.json({ data, error: null });
  } catch (e) {
    return NextResponse.json(
      { data: null, error: e instanceof Error ? e.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
