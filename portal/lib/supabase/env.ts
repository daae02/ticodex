function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Revisá portal/.env.local (ver portal/README.md).`
    )
  }
  return value
}

export const supabaseUrl = () => requiredEnv("SUPABASE_URL")
export const supabasePublishableKey = () =>
  requiredEnv("SUPABASE_PUBLISHABLE_KEY")
export const supabaseStorageBucket = () =>
  process.env.SUPABASE_STORAGE_BUCKET || "especie-media"
