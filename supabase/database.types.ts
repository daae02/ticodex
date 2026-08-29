// Generado con mcp__claude_ai_Supabase__generate_typescript_types
// Proyecto: Ticodex (ref weagfzykzqiixjyqejbc). Regenerar tras cualquier migración
// nueva en lugar de editar a mano.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      candidato_especie: {
        Row: {
          campos_propuestos: Json
          creado_en: string
          especie_id: string | null
          estado: Database["public"]["Enums"]["candidato_estado_enum"]
          fuente: string
          id: string
          tipo_cambio: Database["public"]["Enums"]["candidato_tipo_cambio_enum"]
        }
        Insert: {
          campos_propuestos?: Json
          creado_en?: string
          especie_id?: string | null
          estado?: Database["public"]["Enums"]["candidato_estado_enum"]
          fuente: string
          id?: string
          tipo_cambio: Database["public"]["Enums"]["candidato_tipo_cambio_enum"]
        }
        Update: {
          campos_propuestos?: Json
          creado_en?: string
          especie_id?: string | null
          estado?: Database["public"]["Enums"]["candidato_estado_enum"]
          fuente?: string
          id?: string
          tipo_cambio?: Database["public"]["Enums"]["candidato_tipo_cambio_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "candidato_especie_especie_id_fkey"
            columns: ["especie_id"]
            isOneToOne: false
            referencedRelation: "especie"
            referencedColumns: ["id"]
          },
        ]
      }
      especie: {
        Row: {
          actualizado_en: string
          atribucion_fuente: string | null
          clase_taxonomica: Database["public"]["Enums"]["clase_taxonomica_enum"]
          creado_en: string
          descripcion_en: string | null
          descripcion_es: string | null
          endemica: boolean
          estado_conservacion:
            | Database["public"]["Enums"]["estado_conservacion_enum"]
            | null
          estado_publicacion: Database["public"]["Enums"]["estado_publicacion_enum"]
          familia: string | null
          habitat_en: string | null
          habitat_es: string | null
          id: string
          nombre_cientifico: string
          nombre_comun_en: string | null
          nombre_comun_es: string
          origen_dato: Database["public"]["Enums"]["origen_dato_enum"]
          sonido_url: string | null
          tiene_diferencia_juvenil: boolean
          tiene_dimorfismo_sexual: boolean
          ubicacion_breve_en: string | null
          ubicacion_breve_es: string | null
        }
        Insert: {
          actualizado_en?: string
          atribucion_fuente?: string | null
          clase_taxonomica: Database["public"]["Enums"]["clase_taxonomica_enum"]
          creado_en?: string
          descripcion_en?: string | null
          descripcion_es?: string | null
          endemica?: boolean
          estado_conservacion?:
            | Database["public"]["Enums"]["estado_conservacion_enum"]
            | null
          estado_publicacion?: Database["public"]["Enums"]["estado_publicacion_enum"]
          familia?: string | null
          habitat_en?: string | null
          habitat_es?: string | null
          id?: string
          nombre_cientifico: string
          nombre_comun_en?: string | null
          nombre_comun_es: string
          origen_dato?: Database["public"]["Enums"]["origen_dato_enum"]
          sonido_url?: string | null
          tiene_diferencia_juvenil?: boolean
          tiene_dimorfismo_sexual?: boolean
          ubicacion_breve_en?: string | null
          ubicacion_breve_es?: string | null
        }
        Update: {
          actualizado_en?: string
          atribucion_fuente?: string | null
          clase_taxonomica?: Database["public"]["Enums"]["clase_taxonomica_enum"]
          creado_en?: string
          descripcion_en?: string | null
          descripcion_es?: string | null
          endemica?: boolean
          estado_conservacion?:
            | Database["public"]["Enums"]["estado_conservacion_enum"]
            | null
          estado_publicacion?: Database["public"]["Enums"]["estado_publicacion_enum"]
          familia?: string | null
          habitat_en?: string | null
          habitat_es?: string | null
          id?: string
          nombre_cientifico?: string
          nombre_comun_en?: string | null
          nombre_comun_es?: string
          origen_dato?: Database["public"]["Enums"]["origen_dato_enum"]
          sonido_url?: string | null
          tiene_diferencia_juvenil?: boolean
          tiene_dimorfismo_sexual?: boolean
          ubicacion_breve_en?: string | null
          ubicacion_breve_es?: string | null
        }
        Relationships: []
      }
      especie_foto: {
        Row: {
          es_principal: boolean
          especie_id: string
          id: string
          orden: number
          tipo: Database["public"]["Enums"]["especie_foto_tipo_enum"]
          url: string
        }
        Insert: {
          es_principal?: boolean
          especie_id: string
          id?: string
          orden?: number
          tipo: Database["public"]["Enums"]["especie_foto_tipo_enum"]
          url: string
        }
        Update: {
          es_principal?: boolean
          especie_id?: string
          id?: string
          orden?: number
          tipo?: Database["public"]["Enums"]["especie_foto_tipo_enum"]
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "especie_foto_especie_id_fkey"
            columns: ["especie_id"]
            isOneToOne: false
            referencedRelation: "especie"
            referencedColumns: ["id"]
          },
        ]
      }
      import_job: {
        Row: {
          archivo_csv_url: string | null
          creado_en: string
          filas_error: number
          filas_ok: number
          filas_totales: number
          id: string
          log_errores: Json
          usuario_admin_id: string
        }
        Insert: {
          archivo_csv_url?: string | null
          creado_en?: string
          filas_error?: number
          filas_ok?: number
          filas_totales?: number
          id?: string
          log_errores?: Json
          usuario_admin_id: string
        }
        Update: {
          archivo_csv_url?: string | null
          creado_en?: string
          filas_error?: number
          filas_ok?: number
          filas_totales?: number
          id?: string
          log_errores?: Json
          usuario_admin_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      candidato_estado_enum: "pendiente_revision" | "aprobado" | "descartado"
      candidato_tipo_cambio_enum: "nuevo" | "actualizacion"
      clase_taxonomica_enum:
        | "mamifero"
        | "ave"
        | "reptil"
        | "anfibio"
        | "insecto"
        | "otro"
      especie_foto_tipo_enum: "adulto" | "juvenil" | "macho" | "hembra" | "otro"
      estado_conservacion_enum:
        | "LC"
        | "NT"
        | "VU"
        | "EN"
        | "CR"
        | "EW"
        | "EX"
        | "DD"
      estado_publicacion_enum: "borrador" | "publicado"
      origen_dato_enum: "scraping" | "manual"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      candidato_estado_enum: ["pendiente_revision", "aprobado", "descartado"],
      candidato_tipo_cambio_enum: ["nuevo", "actualizacion"],
      clase_taxonomica_enum: [
        "mamifero",
        "ave",
        "reptil",
        "anfibio",
        "insecto",
        "otro",
      ],
      especie_foto_tipo_enum: ["adulto", "juvenil", "macho", "hembra", "otro"],
      estado_conservacion_enum: [
        "LC",
        "NT",
        "VU",
        "EN",
        "CR",
        "EW",
        "EX",
        "DD",
      ],
      estado_publicacion_enum: ["borrador", "publicado"],
      origen_dato_enum: ["scraping", "manual"],
    },
  },
} as const
