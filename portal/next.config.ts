import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    // portal/ no es la raíz del repo: lib/database.types.ts reexporta
    // ../../supabase/database.types.ts (raíz de Ticodex, fuente de verdad
    // publicada por backend-supabase) y lib/csv/templateFile.ts lee
    // ../../data/template_especies.csv. Turbopack no resuelve módulos fuera
    // de su root por defecto — hay que decirle explícitamente que la raíz
    // real del proyecto es Ticodex/, un nivel arriba de portal/.
    root: path.join(__dirname, ".."),
  },
};

export default nextConfig;
