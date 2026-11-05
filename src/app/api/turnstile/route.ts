import { NextResponse } from "next/server";

const SECRET_KEY = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

export async function POST(request: Request) {
  if (!SECRET_KEY) {
    return NextResponse.json(
      { success: false, error: "Falta configuración de CLOUDFLARE_TURNSTILE_SECRET_KEY" },
      { status: 500 }
    );
  }

  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Cuerpo inválido" }, { status: 400 });
  }

  const token = body.token;
  if (!token || typeof token !== "string") {
    return NextResponse.json({ success: false, error: "Falta el token" }, { status: 400 });
  }

  try {
    const formData = new FormData();
    formData.append("secret", SECRET_KEY);
    formData.append("response", token);

    const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });

    const result = await verification.json();

    if (result.success) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: result["error-codes"]?.join(", ") || "Validación fallida" },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Error al validar con Cloudflare" },
      { status: 502 }
    );
  }
}
