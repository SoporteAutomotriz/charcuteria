import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Endpoint solo para la prueba de hosting de la Fase 1.
 * Solo responde en entorno de desarrollo (NODE_ENV !== 'production').
 * No debe exponerse en producción ni preview.
 */
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Endpoint deshabilitado fuera de entorno de desarrollo" },
      { status: 403 },
    );
  }

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
