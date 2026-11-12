import { createClient } from "@/lib/supabase/server";

/**
 * Panel de inicio — indicadores para el propietario.
 * Solo lee tablas públicas y de auditoría; nunca expone costos ni márgenes.
 */
export default async function PanelHome() {
  const supabase = await createClient();

  // Conteos simples para el dashboard (solo tablas públicas)
  const [productosRes, paquetesRes, usuariosRes, cotizacionesRes] =
    await Promise.all([
      supabase.from("productos").select("count", { head: true }),
      supabase.from("paquetes").select("count", { head: true }),
      supabase.from("usuarios_personal").select("count", { head: true }),
      supabase.from("cotizaciones").select("count", { head: true }),
    ]);

  const totalProductos = productosRes.count ?? 0;
  const totalPaquetes = paquetesRes.count ?? 0;
  const totalUsuarios = usuariosRes.count ?? 0;
  const totalCotizaciones = cotizacionesRes.count ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Panel del propietario</h1>
        <p className="text-zinc-600">
          Resumen del negocio de tablas de charcutería y quesos para eventos.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          title="Productos en catálogo"
          value={totalProductos}
          subtitle={totalProductos === 0 ? "Aún no hay productos" : "Activos"}
        />
        <Card
          title="Paquetes"
          value={totalPaquetes}
          subtitle={totalPaquetes === 0 ? "Aún no hay paquetes" : "Configurados"}
        />
        <Card
          title="Usuarios del personal"
          value={totalUsuarios}
          subtitle="Con acceso al panel"
        />
        <Card
          title="Cotizaciones"
          value={totalCotizaciones}
          subtitle="En el sistema"
        />
      </div>

      <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">Próximos pasos</h2>
        <ul className="list-disc list-inside text-zinc-600 space-y-2">
          <li>
            Configura el <strong>catálogo de productos</strong> con fotos, costos
            y márgenes.
          </li>
          <li>
            Crea entre 3 y 6 <strong>paquetes iniciales</strong> con sus reglas
            de personalización.
          </li>
          <li>
            Define <strong>zonas de transporte</strong> y tarifas de montaje y
            personal.
          </li>
          <li>
            Ajusta <strong>márgenes por categoría</strong> y la tasa de IVA.
          </li>
        </ul>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-amber-800 mb-2">
          Datos pendiente del dueño (PENDIENTE-DUEÑO)
        </h3>
        <p className="text-sm text-amber-700">
          Los valores de costo, margen, tarifa y gramaje no están en el código.
          Cárgalos desde este panel. En pruebas se usan datos ficticios
          etiquetados como tales.
        </p>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: number | string;
  subtitle: string;
}) {
  return (
    <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
      <p className="text-sm text-zinc-500">{title}</p>
      <p className="text-2xl font-bold text-zinc-900">{value}</p>
      <p className="text-xs text-zinc-400">{subtitle}</p>
    </div>
  );
}
