import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Cargar variables de entorno desde .env.local para que las pruebas de
// integración de RLS puedan leer NEXT_PUBLIC_SUPABASE_URL y
// NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY automáticamente.
const env = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
    }
  : {};

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],
    env,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
