import { describe, it, expect } from "vitest";
import { generarIdempotencyKey } from "./action";

/**
 * Pruebas de la clave de idempotencia del Server Action (Fase 5).
 *
 * generarIdempotencyKey es pura y se puede probar sin Supabase ni red.
 */

describe("generarIdempotencyKey", () => {
  it("genera una clave con el prefijo 'idem-'", () => {
    const key = generarIdempotencyKey();
    expect(key).toMatch(/^idem-/);
  });

  it("genera una clave única en cada llamada", () => {
    const a = generarIdempotencyKey();
    const b = generarIdempotencyKey();
    expect(a).not.toBe(b);
  });

  it("genera claves criptográficamente seguras (prefijo + UUID con guiones)", () => {
    const key = generarIdempotencyKey();
    // "idem-" (5) + UUID con guiones (36) = 41
    expect(key).toHaveLength(41);
    expect(key.slice(5)).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it("no genera claves predecibles (formato UUID aleatorio)", () => {
    const keys = new Set<string>();
    for (let i = 0; i < 50; i++) {
      keys.add(generarIdempotencyKey());
    }
    expect(keys.size).toBe(50);
  });
});
