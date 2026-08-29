/// Credenciales públicas del proyecto Supabase de Ticodex
/// (ref `weagfzykzqiixjyqejbc`, ver PROYECTO.md sección 5).
///
/// Son seguras de embeber en el cliente: la publishable key solo habilita lo
/// que las políticas de Row Level Security del backend permiten. Esta app no
/// hace login ni escritura, solo lecturas de `especie`/`especie_foto`
/// publicadas.
class SupabaseConfig {
  const SupabaseConfig._();

  static const String url = 'https://weagfzykzqiixjyqejbc.supabase.co';

  static const String publishableKey =
      'sb_publishable_kgcWvgOZdOfo_pr0Z-YLSA__w0cj5h1';
}
