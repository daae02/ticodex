import '../models/especie.dart';

/// Idioma activo de la app. Es un único toggle global (afecta lista y
/// ficha por igual) — decisión de UI: el mockup de la lista también muestra
/// "ES·EN" en la barra superior, así que el toggle no se limita a la ficha
/// de detalle.
enum AppLanguage { es, en }

/// Todos los textos de interfaz de la app, en los dos idiomas soportados.
/// No usamos el sistema `flutter_localizations`/`.arb` porque el alcance es
/// chico (una sola pantalla de lista + una de detalle, sin plurales ni
/// fechas) — un mapa de strings a mano alcanza y es más fácil de auditar.
class AppStrings {
  const AppStrings({
    required this.appTitle,
    required this.searchHint,
    required this.loading,
    required this.errorTitle,
    required this.retry,
    required this.offlineBanner,
    required this.emptySearch,
    required this.emptyCatalog,
    required this.back,
    required this.descriptionTitle,
    required this.habitatTitle,
    required this.locationTitle,
    required this.photosTitle,
    required this.otherPhotosTitle,
    required this.photoPending,
    required this.translationPending,
    required this.playSound,
    required this.playingSound,
    required this.soundError,
    required this.conservationStatus,
    required this.noConservationData,
    required this.endemicLabel,
    required this.claseLabels,
    required this.tipoFotoLabels,
    required this.iucnLabels,
  });

  final String appTitle;
  final String searchHint;
  final String loading;
  final String errorTitle;
  final String retry;
  final String offlineBanner;
  final String emptySearch;
  final String emptyCatalog;
  final String back;
  final String descriptionTitle;
  final String habitatTitle;
  final String locationTitle;
  final String photosTitle;
  final String otherPhotosTitle;
  final String photoPending;
  final String translationPending;
  final String playSound;
  final String playingSound;
  final String soundError;
  final String conservationStatus;
  final String noConservationData;
  final String endemicLabel;
  final Map<ClaseTaxonomica, String> claseLabels;
  final Map<FotoTipo, String> tipoFotoLabels;
  final Map<EstadoConservacion, String> iucnLabels;
}

const AppStrings esStrings = AppStrings(
  appTitle: 'TICODEX',
  searchHint: 'Buscar por nombre...',
  loading: 'CARGANDO CATÁLOGO...',
  errorTitle: 'NO SE PUDO CARGAR EL CATÁLOGO',
  retry: 'REINTENTAR',
  offlineBanner: 'SIN CONEXIÓN · MOSTRANDO DATOS GUARDADOS',
  emptySearch: 'Sin resultados para tu búsqueda.',
  emptyCatalog: 'Todavía no hay especies publicadas.',
  back: '< ATRÁS',
  descriptionTitle: 'DESCRIPCIÓN',
  habitatTitle: 'HÁBITAT',
  locationTitle: 'UBICACIÓN',
  photosTitle: 'FOTOS',
  otherPhotosTitle: 'OTRAS FOTOS',
  photoPending: 'PENDIENTE',
  translationPending: '(traducción pendiente)',
  playSound: 'REPRODUCIR SONIDO',
  playingSound: 'REPRODUCIENDO...',
  soundError: 'No se pudo reproducir el sonido.',
  conservationStatus: 'Estado de conservación (UICN)',
  noConservationData: 'Sin dato de conservación',
  endemicLabel: 'ENDÉMICA',
  claseLabels: {
    ClaseTaxonomica.mamifero: 'Mamífero',
    ClaseTaxonomica.ave: 'Ave',
    ClaseTaxonomica.reptil: 'Reptil',
    ClaseTaxonomica.anfibio: 'Anfibio',
    ClaseTaxonomica.insecto: 'Insecto',
    ClaseTaxonomica.otro: 'Otro',
  },
  tipoFotoLabels: {
    FotoTipo.adulto: 'ADULTO',
    FotoTipo.juvenil: 'JUVENIL',
    FotoTipo.macho: 'MACHO',
    FotoTipo.hembra: 'HEMBRA',
    FotoTipo.otro: 'OTRA',
  },
  iucnLabels: {
    EstadoConservacion.LC: 'Preocupación menor',
    EstadoConservacion.NT: 'Casi amenazada',
    EstadoConservacion.VU: 'Vulnerable',
    EstadoConservacion.EN: 'En peligro',
    EstadoConservacion.CR: 'En peligro crítico',
    EstadoConservacion.EW: 'Extinta en estado silvestre',
    EstadoConservacion.EX: 'Extinta',
    EstadoConservacion.DD: 'Datos insuficientes',
  },
);

const AppStrings enStrings = AppStrings(
  appTitle: 'TICODEX',
  searchHint: 'Search by name...',
  loading: 'LOADING CATALOG...',
  errorTitle: 'COULD NOT LOAD THE CATALOG',
  retry: 'RETRY',
  offlineBanner: 'OFFLINE · SHOWING SAVED DATA',
  emptySearch: 'No results for your search.',
  emptyCatalog: 'No published species yet.',
  back: '< BACK',
  descriptionTitle: 'DESCRIPTION',
  habitatTitle: 'HABITAT',
  locationTitle: 'LOCATION',
  photosTitle: 'PHOTOS',
  otherPhotosTitle: 'OTHER PHOTOS',
  photoPending: 'PENDING',
  translationPending: '(translation pending)',
  playSound: 'PLAY SOUND',
  playingSound: 'PLAYING...',
  soundError: 'Could not play the sound.',
  conservationStatus: 'Conservation status (IUCN)',
  noConservationData: 'No conservation data',
  endemicLabel: 'ENDEMIC',
  claseLabels: {
    ClaseTaxonomica.mamifero: 'Mammal',
    ClaseTaxonomica.ave: 'Bird',
    ClaseTaxonomica.reptil: 'Reptile',
    ClaseTaxonomica.anfibio: 'Amphibian',
    ClaseTaxonomica.insecto: 'Insect',
    ClaseTaxonomica.otro: 'Other',
  },
  tipoFotoLabels: {
    FotoTipo.adulto: 'ADULT',
    FotoTipo.juvenil: 'JUVENILE',
    FotoTipo.macho: 'MALE',
    FotoTipo.hembra: 'FEMALE',
    FotoTipo.otro: 'OTHER',
  },
  iucnLabels: {
    EstadoConservacion.LC: 'Least concern',
    EstadoConservacion.NT: 'Near threatened',
    EstadoConservacion.VU: 'Vulnerable',
    EstadoConservacion.EN: 'Endangered',
    EstadoConservacion.CR: 'Critically endangered',
    EstadoConservacion.EW: 'Extinct in the wild',
    EstadoConservacion.EX: 'Extinct',
    EstadoConservacion.DD: 'Data deficient',
  },
);

AppStrings stringsFor(AppLanguage lang) =>
    lang == AppLanguage.es ? esStrings : enStrings;
