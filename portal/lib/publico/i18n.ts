import type { Enums } from "@/lib/database.types"

/**
 * Textos y etiquetas de la superficie pública del portal (catálogo real:
 * grid + ficha). Es la MISMA experiencia de contenido que la app Flutter
 * (PROYECTO.md §8, "App móvil", punto 2) — este archivo replica a propósito
 * `mobile/lib/l10n/strings.dart` para que las dos superficies digan lo mismo.
 *
 * Alcance chico (dos pantallas, sin plurales ni fechas) → un mapa de strings
 * a mano, igual que en la app. No usamos `next-intl` ni `.arb`.
 */
export type Idioma = "es" | "en"

export const IDIOMAS: readonly Idioma[] = ["es", "en"] as const

interface TextosPublico {
  tagline: string
  catalogoVacio: string
  fichaNoEncontrada: string
  volverAlCatalogo: string
  nombreCientificoLabel: string
  descripcionTitulo: string
  habitatTitulo: string
  ubicacionTitulo: string
  fotosTitulo: string
  otrasFotosTitulo: string
  fotoPendiente: string
  traduccionPendiente: string
  sonidoTitulo: string
  estadoConservacion: string
  sinDatoConservacion: string
  endemica: string
  accesoEquipoInterno: string
}

export const TEXTOS: Record<Idioma, TextosPublico> = {
  es: {
    tagline: "Fauna de Costa Rica",
    catalogoVacio: "Todavía no hay especies publicadas.",
    fichaNoEncontrada: "Esta especie no está publicada o no existe.",
    volverAlCatalogo: "< VOLVER AL CATÁLOGO",
    nombreCientificoLabel: "Nombre científico",
    descripcionTitulo: "DESCRIPCIÓN",
    habitatTitulo: "HÁBITAT",
    ubicacionTitulo: "UBICACIÓN",
    fotosTitulo: "FOTOS",
    otrasFotosTitulo: "OTRAS FOTOS",
    fotoPendiente: "PENDIENTE",
    traduccionPendiente: "(traducción pendiente)",
    sonidoTitulo: "SONIDO",
    estadoConservacion: "Estado de conservación (UICN)",
    sinDatoConservacion: "Sin dato de conservación",
    endemica: "ENDÉMICA",
    accesoEquipoInterno: "Acceso equipo interno",
  },
  en: {
    tagline: "Wildlife of Costa Rica",
    catalogoVacio: "No published species yet.",
    fichaNoEncontrada: "This species is not published or does not exist.",
    volverAlCatalogo: "< BACK TO CATALOG",
    nombreCientificoLabel: "Scientific name",
    descripcionTitulo: "DESCRIPTION",
    habitatTitulo: "HABITAT",
    ubicacionTitulo: "LOCATION",
    fotosTitulo: "PHOTOS",
    otrasFotosTitulo: "OTHER PHOTOS",
    fotoPendiente: "PENDING",
    traduccionPendiente: "(translation pending)",
    sonidoTitulo: "SOUND",
    estadoConservacion: "Conservation status (IUCN)",
    sinDatoConservacion: "No conservation data",
    endemica: "ENDEMIC",
    accesoEquipoInterno: "Internal team access",
  },
}

type ClaseTaxonomica = Enums<"clase_taxonomica_enum">
type EstadoConservacion = Enums<"estado_conservacion_enum">
type FotoTipo = Enums<"especie_foto_tipo_enum">

export const CLASE_LABELS: Record<Idioma, Record<ClaseTaxonomica, string>> = {
  es: {
    mamifero: "Mamífero",
    ave: "Ave",
    reptil: "Reptil",
    anfibio: "Anfibio",
    insecto: "Insecto",
    otro: "Otro",
  },
  en: {
    mamifero: "Mammal",
    ave: "Bird",
    reptil: "Reptile",
    anfibio: "Amphibian",
    insecto: "Insect",
    otro: "Other",
  },
}

export const TIPO_FOTO_LABELS: Record<Idioma, Record<FotoTipo, string>> = {
  es: {
    adulto: "ADULTO",
    juvenil: "JUVENIL",
    macho: "MACHO",
    hembra: "HEMBRA",
    otro: "OTRA",
  },
  en: {
    adulto: "ADULT",
    juvenil: "JUVENILE",
    macho: "MALE",
    hembra: "FEMALE",
    otro: "OTHER",
  },
}

/** Etiqueta larga y traducida del código UICN. El código (LC/NT/…) en sí no
 * se traduce: es un estándar internacional de 2 letras. */
export const IUCN_LABELS: Record<Idioma, Record<EstadoConservacion, string>> = {
  es: {
    LC: "Preocupación menor",
    NT: "Casi amenazada",
    VU: "Vulnerable",
    EN: "En peligro",
    CR: "En peligro crítico",
    EW: "Extinta en estado silvestre",
    EX: "Extinta",
    DD: "Datos insuficientes",
  },
  en: {
    LC: "Least concern",
    NT: "Near threatened",
    VU: "Vulnerable",
    EN: "Endangered",
    CR: "Critically endangered",
    EW: "Extinct in the wild",
    EX: "Extinct",
    DD: "Data deficient",
  },
}

/** Clase CSS del badge de conservación por código (definidas en globals.css). */
export const IUCN_BADGE_CLASS: Record<EstadoConservacion, string> = {
  LC: "badge-lc",
  NT: "badge-nt",
  VU: "badge-vu",
  EN: "badge-en",
  CR: "badge-cr",
  EW: "badge-ew",
  EX: "badge-ex",
  DD: "badge-dd",
}
