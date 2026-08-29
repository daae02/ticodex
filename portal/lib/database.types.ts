// No dupliques este archivo a mano. Los tipos reales viven en
// `supabase/database.types.ts` (raíz del repo Ticodex) y los publica el agente
// `backend-supabase` corriendo `generate_typescript_types` tras cada migración.
// Este archivo solo re-exporta ese contrato para que el resto de `portal/`
// importe desde una ruta corta (`@/lib/database.types`) en vez de repetir la
// ruta relativa `../../supabase/database.types` en todos lados.
export type {
  Database,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  CompositeTypes,
} from "../../supabase/database.types"
export { Constants } from "../../supabase/database.types"
