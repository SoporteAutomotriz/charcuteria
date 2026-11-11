/**
 * Tipos de la base de datos Supabase para el proyecto Charcutería.
 * Generados a partir del esquema de supabase/migrations/.
 * Se actualizan manualmente cuando se agregan nuevas tablas o columnas.
 */

export type Database = {
  public: {
    Tables: {
      usuarios_personal: {
        Row: {
          id: string;
          email: string;
          rol: "propietario" | "administrador";
          nombre: string;
          activo: boolean;
          creado_en: string;
        };
        Insert: {
          id: string;
          email: string;
          rol: "propietario" | "administrador";
          nombre: string;
          activo?: boolean;
          creado_en?: string;
        };
        Update: {
          id?: string;
          email?: string;
          rol?: "propietario" | "administrador";
          nombre?: string;
          activo?: boolean;
          creado_en?: string;
        };
      };
      categorias: {
        Row: {
          id: number;
          nombre: string;
          orden_visualizacion: number;
          activo: boolean;
          creado_en: string;
        };
        Insert: {
          id?: number;
          nombre: string;
          orden_visualizacion?: number;
          activo?: boolean;
          creado_en?: string;
        };
        Update: {
          id?: number;
          nombre?: string;
          orden_visualizacion?: number;
          activo?: boolean;
          creado_en?: string;
        };
      };
      productos: {
        Row: {
          id: number;
          categoria_id: number | null;
          nombre: string;
          descripcion: string | null;
          foto_url: string | null;
          orden_visualizacion: number;
          unidad_compra: string;
          unidad_venta: string;
          factor_conversion: number;
          merma_pct: number;
          porcion_referencia_persona: number | null;
          alergenos: string[] | null;
          etiquetas: string[] | null;
          estado: "activo" | "agotado_temporal" | "inactivo";
          creado_en: string;
          actualizado_en: string;
        };
        Insert: {
          id?: number;
          categoria_id?: number | null;
          nombre: string;
          descripcion?: string | null;
          foto_url?: string | null;
          orden_visualizacion?: number;
          unidad_compra: string;
          unidad_venta: string;
          factor_conversion?: number;
          merma_pct?: number;
          porcion_referencia_persona?: number | null;
          alergenos?: string[] | null;
          etiquetas?: string[] | null;
          estado?: "activo" | "agotado_temporal" | "inactivo";
          creado_en?: string;
          actualizado_en?: string;
        };
        Update: {
          id?: number;
          categoria_id?: number | null;
          nombre?: string;
          descripcion?: string | null;
          foto_url?: string | null;
          orden_visualizacion?: number;
          unidad_compra?: string;
          unidad_venta?: string;
          factor_conversion?: number;
          merma_pct?: number;
          porcion_referencia_persona?: number | null;
          alergenos?: string[] | null;
          etiquetas?: string[] | null;
          estado?: "activo" | "agotado_temporal" | "inactivo";
          creado_en?: string;
          actualizado_en?: string;
        };
      };
      paquetes: {
        Row: {
          id: number;
          nombre: string;
          foto_url: string | null;
          descripcion: string | null;
          personas_recomendadas: number;
          creado_en: string;
          actualizado_en: string;
        };
        Insert: {
          id?: number;
          nombre: string;
          foto_url?: string | null;
          descripcion?: string | null;
          personas_recomendadas?: number;
          creado_en?: string;
          actualizado_en?: string;
        };
        Update: {
          id?: number;
          nombre?: string;
          foto_url?: string | null;
          descripcion?: string | null;
          personas_recomendadas?: number;
          creado_en?: string;
          actualizado_en?: string;
        };
      };
      paquete_componentes: {
        Row: {
          id: number;
          paquete_id: number;
          categoria_id: number | null;
          nombre: string;
          cantidad_referencia: number;
          tipo: "fijo" | "sustituible" | "opcional" | "quitable";
          creado_en: string;
        };
        Insert: {
          id?: number;
          paquete_id: number;
          categoria_id?: number | null;
          nombre: string;
          cantidad_referencia?: number;
          tipo?: "fijo" | "sustituible" | "opcional" | "quitable";
          creado_en?: string;
        };
        Update: {
          id?: number;
          paquete_id?: number;
          categoria_id?: number | null;
          nombre?: string;
          cantidad_referencia?: number;
          tipo?: "fijo" | "sustituible" | "opcional" | "quitable";
          creado_en?: string;
        };
      };
      zonas_transporte: {
        Row: {
          id: number;
          nombre: string;
          municipios: string[];
          tarifa_fija: number;
          cargo_distancia: number;
          cargo_horario: number;
          cargo_acceso_dificil: number;
          zona_especial: boolean;
          activo: boolean;
        };
        Insert: {
          id?: number;
          nombre: string;
          municipios: string[];
          tarifa_fija?: number;
          cargo_distancia?: number;
          cargo_horario?: number;
          cargo_acceso_dificil?: number;
          zona_especial?: boolean;
          activo?: boolean;
        };
        Update: {
          id?: number;
          nombre?: string;
          municipios?: string[];
          tarifa_fija?: number;
          cargo_distancia?: number;
          cargo_horario?: number;
          cargo_acceso_dificil?: number;
          zona_especial?: boolean;
          activo?: boolean;
        };
      };
      tarifas_montaje: {
        Row: {
          id: number;
          tarifa_hora: number;
          horas_minimas: number;
          regla_personal_por_invitados: number;
          activo: boolean;
        };
        Insert: {
          id?: number;
          tarifa_hora?: number;
          horas_minimas?: number;
          regla_personal_por_invitados?: number;
          activo?: boolean;
        };
        Update: {
          id?: number;
          tarifa_hora?: number;
          horas_minimas?: number;
          regla_personal_por_invitados?: number;
          activo?: boolean;
        };
      };
      perfiles_consumo: {
        Row: {
          id: number;
          tipo_evento: string;
          duracion_rango: string | null;
          categoria: string;
          gramos_por_persona: number;
          es_comida_principal: boolean;
          activo: boolean;
        };
        Insert: {
          id?: number;
          tipo_evento: string;
          duracion_rango?: string | null;
          categoria: string;
          gramos_por_persona?: number;
          es_comida_principal?: boolean;
          activo?: boolean;
        };
        Update: {
          id?: number;
          tipo_evento?: string;
          duracion_rango?: string | null;
          categoria?: string;
          gramos_por_persona?: number;
          es_comida_principal?: boolean;
          activo?: boolean;
        };
      };
      parametros_globales: {
        Row: {
          id: number;
          clave: string;
          valor: Json;
          descripcion: string | null;
          creado_en: string;
          actualizado_en: string;
        };
        Insert: {
          id?: number;
          clave: string;
          valor: Json;
          descripcion?: string | null;
          creado_en?: string;
          actualizado_en?: string;
        };
        Update: {
          id?: number;
          clave?: string;
          valor?: Json;
          descripcion?: string | null;
          creado_en?: string;
          actualizado_en?: string;
        };
      };
      bitacora_auditoria: {
        Row: {
          id: number;
          tabla_afectada: string;
          registro_id: number;
          accion: "insert" | "update" | "delete";
          valores_anteriores: Json | null;
          valores_nuevos: Json | null;
          usuario_id: string | null;
          ip: string | null;
          fecha: string;
        };
        Insert: {
          id?: number;
          tabla_afectada: string;
          registro_id: number;
          accion: "insert" | "update" | "delete";
          valores_anteriores?: Json | null;
          valores_nuevos?: Json | null;
          usuario_id?: string | null;
          ip?: string | null;
          fecha?: string;
        };
        Update: {
          id?: number;
          tabla_afectada?: string;
          registro_id?: number;
          accion?: "insert" | "update" | "delete";
          valores_anteriores?: Json | null;
          valores_nuevos?: Json | null;
          usuario_id?: string | null;
          ip?: string | null;
          fecha?: string;
        };
      };
      cotizaciones: {
        Row: {
          id: number;
          folio: string | null;
          estado: string;
          cliente_nombre: string | null;
          cliente_telefono: string | null;
          cliente_correo: string | null;
          total_venta: string | null;
          creado_en: string;
          actualizado_en: string;
        };
        Insert: {
          id?: number;
          folio?: string | null;
          estado?: string;
          cliente_nombre?: string | null;
          cliente_telefono?: string | null;
          cliente_correo?: string | null;
          total_venta?: string | null;
          creado_en?: string;
          actualizado_en?: string;
        };
        Update: {
          id?: number;
          folio?: string | null;
          estado?: string;
          cliente_nombre?: string | null;
          cliente_telefono?: string | null;
          cliente_correo?: string | null;
          total_venta?: string | null;
          creado_en?: string;
          actualizado_en?: string;
        };
      };
      cotizaciones_costos: {
        Row: {
          id: number;
          cotizacion_id: number;
          total_costo: string;
          datos_costo: Json;
          creado_en: string;
        };
        Insert: {
          id?: number;
          cotizacion_id: number;
          total_costo: string;
          datos_costo: Json;
          creado_en?: string;
        };
        Update: {
          id?: number;
          cotizacion_id?: number;
          total_costo?: string;
          datos_costo?: Json;
          creado_en?: string;
        };
      };
      producto_costos: {
        Row: {
          id: number;
          producto_id: number;
          costo_unitario_compra: string;
          creado_en: string;
          actualizado_en: string;
        };
        Insert: {
          id?: number;
          producto_id: number;
          costo_unitario_compra: string;
          creado_en?: string;
          actualizado_en?: string;
        };
        Update: {
          id?: number;
          producto_id?: number;
          costo_unitario_compra?: string;
          creado_en?: string;
          actualizado_en?: string;
        };
      };
      producto_margenes: {
        Row: {
          id: number;
          producto_id: number;
          margen_propio_pct: string;
          precio_fijo_manual: string | null;
          creado_en: string;
          actualizado_en: string;
        };
        Insert: {
          id?: number;
          producto_id: number;
          margen_propio_pct: string;
          precio_fijo_manual?: string | null;
          creado_en?: string;
          actualizado_en?: string;
        };
        Update: {
          id?: number;
          producto_id?: number;
          margen_propio_pct?: number;
          precio_fijo_manual?: string | null;
          creado_en?: string;
          actualizado_en?: string;
        };
      };
      paquete_margenes: {
        Row: {
          id: number;
          paquete_id: number;
          margen_propio_pct: string;
          precio_fijo_manual: string | null;
          creado_en: string;
          actualizado_en: string;
        };
        Insert: {
          id?: number;
          paquete_id: number;
          margen_propio_pct: string;
          precio_fijo_manual?: string | null;
          creado_en?: string;
          actualizado_en?: string;
        };
        Update: {
          id?: number;
          paquete_id?: number;
          margen_propio_pct?: number;
          precio_fijo_manual?: string | null;
          creado_en?: string;
          actualizado_en?: string;
        };
      };
    };
    Views: {
      [_ in string]: never;
    };
    Functions: {
      [_ in string]: never;
    };
    Enums: {
      [_ in string]: never;
    };
    CompositeTypes: {
      [_ in string]: never;
    };
  };
};

export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };
