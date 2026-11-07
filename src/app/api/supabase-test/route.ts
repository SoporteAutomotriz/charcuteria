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
    const raw = e as Record<string, unknown> | undefined;
    const errorInfo: Record<string, unknown> = {};

    if (raw?.message) errorInfo.message = raw.message;
    if (raw?.code) errorInfo.code = raw.code;
    if (raw?.details) errorInfo.details = raw.details;
    if (raw?.hint) errorInfo.hint = raw.hint;

    if (Object.keys(errorInfo).length === 0) {
      errorInfo.message = typeof e === "string" ? e : "Error desconocido";
    }

    return NextResponse.json(
      { data: null, error: errorInfo },
      { status: 500 }
    );
  }
}
