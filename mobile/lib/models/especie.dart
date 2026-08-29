// Los códigos UICN (LC, NT, VU...) son un estándar internacional de 2
// letras mayúsculas — mantenerlos así, en vez de lowerCamelCase, es más
// legible y coincide con el enum de la base (`estado_conservacion_enum`).
// ignore_for_file: constant_identifier_names

import '../l10n/strings.dart';

/// Refleja `clase_taxonomica_enum` de `supabase/database.types.ts`.
enum ClaseTaxonomica { mamifero, ave, reptil, anfibio, insecto, otro }

ClaseTaxonomica claseTaxonomicaFromString(String value) {
  return ClaseTaxonomica.values.firstWhere(
    (e) => e.name == value,
    orElse: () => ClaseTaxonomica.otro,
  );
}

/// Refleja `estado_conservacion_enum` (categorías UICN).
enum EstadoConservacion { LC, NT, VU, EN, CR, EW, EX, DD }

EstadoConservacion? estadoConservacionFromString(String? value) {
  if (value == null) return null;
  return EstadoConservacion.values.firstWhere(
    (e) => e.name == value,
    orElse: () => EstadoConservacion.DD,
  );
}

/// Refleja `especie_foto_tipo_enum`.
enum FotoTipo { adulto, juvenil, macho, hembra, otro }

FotoTipo fotoTipoFromString(String value) {
  return FotoTipo.values.firstWhere(
    (e) => e.name == value,
    orElse: () => FotoTipo.otro,
  );
}

/// Orden fijo en el que se muestran los 4 slots de foto en la ficha, según
/// PROYECTO.md §8: "fotos por tipo (adulto, juvenil, macho, hembra)".
/// `otro` no tiene slot fijo — se muestra aparte, si existe.
///
/// Esta es la lista completa de slots posibles; no todos se muestran para
/// toda especie — ver [fotoSlotsFor].
const List<FotoTipo> fichaFotoSlots = [
  FotoTipo.adulto,
  FotoTipo.juvenil,
  FotoTipo.macho,
  FotoTipo.hembra,
];

/// Slots de foto a mostrar en la ficha para una especie concreta.
///
/// ADULTO siempre se muestra (con foto o "pendiente" si falta — eso se
/// exige siempre). JUVENIL solo se muestra si la especie tiene diferencia
/// juvenil documentada (`tieneDiferenciaJuvenil`); MACHO y HEMBRA solo si
/// tiene dimorfismo sexual documentado (`tieneDimorfismoSexual`). Si
/// ninguno de los dos aplica, la ficha muestra solo el slot ADULTO — un
/// slot vacío no significa que la variación exista y falte la foto, sino
/// que la variación no existe para esa especie.
List<FotoTipo> fotoSlotsFor(Especie especie) => [
  FotoTipo.adulto,
  if (especie.tieneDiferenciaJuvenil) FotoTipo.juvenil,
  if (especie.tieneDimorfismoSexual) ...[FotoTipo.macho, FotoTipo.hembra],
];

class EspecieFoto {
  const EspecieFoto({
    required this.id,
    required this.especieId,
    required this.tipo,
    required this.url,
    required this.esPrincipal,
    required this.orden,
  });

  final String id;
  final String especieId;
  final FotoTipo tipo;
  final String url;
  final bool esPrincipal;
  final int orden;

  factory EspecieFoto.fromJson(Map<String, dynamic> json) {
    return EspecieFoto(
      id: json['id'] as String,
      especieId: json['especie_id'] as String,
      tipo: fotoTipoFromString(json['tipo'] as String),
      url: json['url'] as String,
      esPrincipal: json['es_principal'] as bool? ?? false,
      orden: (json['orden'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'especie_id': especieId,
    'tipo': tipo.name,
    'url': url,
    'es_principal': esPrincipal,
    'orden': orden,
  };
}

class Especie {
  const Especie({
    required this.id,
    required this.nombreComunEs,
    required this.nombreComunEn,
    required this.nombreCientifico,
    required this.claseTaxonomica,
    required this.familia,
    required this.estadoConservacion,
    required this.endemica,
    required this.descripcionEs,
    required this.descripcionEn,
    required this.habitatEs,
    required this.habitatEn,
    required this.ubicacionBreveEs,
    required this.ubicacionBreveEn,
    required this.sonidoUrl,
    required this.atribucionFuente,
    required this.tieneDimorfismoSexual,
    required this.tieneDiferenciaJuvenil,
    required this.fotos,
  });

  final String id;
  final String nombreComunEs;
  final String? nombreComunEn;
  final String nombreCientifico;
  final ClaseTaxonomica claseTaxonomica;
  final String? familia;
  final EstadoConservacion? estadoConservacion;
  final bool endemica;
  final String? descripcionEs;
  final String? descripcionEn;
  final String? habitatEs;
  final String? habitatEn;
  final String? ubicacionBreveEs;
  final String? ubicacionBreveEn;
  final String? sonidoUrl;
  /// Texto de atribución legible (ej. "Datos: Wikipedia (CC-BY-SA), GBIF"),
  /// solo cuando el contenido viene de una fuente que la exige. No es un
  /// campo de contenido de ficha (como descripción/hábitat): si es `null`
  /// no hay nada que atribuir, no es una traducción faltante — PROYECTO.md §9.
  final String? atribucionFuente;
  /// Si `true`, la ficha muestra los slots de foto MACHO y HEMBRA; si
  /// `false`, la especie no tiene dimorfismo sexual documentado y esos
  /// slots no se muestran (no quedan vacíos "pendientes" para siempre).
  final bool tieneDimorfismoSexual;
  /// Si `true`, la ficha muestra el slot de foto JUVENIL; si `false`, no
  /// hay diferencia juvenil documentada y el slot no se muestra.
  final bool tieneDiferenciaJuvenil;
  final List<EspecieFoto> fotos;

  factory Especie.fromJson(Map<String, dynamic> json) {
    final fotosJson = (json['especie_foto'] as List<dynamic>?) ?? const [];
    final fotos = fotosJson
        .map((f) => EspecieFoto.fromJson(f as Map<String, dynamic>))
        .toList()
      ..sort((a, b) => a.orden.compareTo(b.orden));
    return Especie(
      id: json['id'] as String,
      nombreComunEs: json['nombre_comun_es'] as String,
      nombreComunEn: json['nombre_comun_en'] as String?,
      nombreCientifico: json['nombre_cientifico'] as String,
      claseTaxonomica: claseTaxonomicaFromString(
        json['clase_taxonomica'] as String,
      ),
      familia: json['familia'] as String?,
      estadoConservacion: estadoConservacionFromString(
        json['estado_conservacion'] as String?,
      ),
      endemica: json['endemica'] as bool? ?? false,
      descripcionEs: json['descripcion_es'] as String?,
      descripcionEn: json['descripcion_en'] as String?,
      habitatEs: json['habitat_es'] as String?,
      habitatEn: json['habitat_en'] as String?,
      ubicacionBreveEs: json['ubicacion_breve_es'] as String?,
      ubicacionBreveEn: json['ubicacion_breve_en'] as String?,
      sonidoUrl: json['sonido_url'] as String?,
      atribucionFuente: json['atribucion_fuente'] as String?,
      tieneDimorfismoSexual: json['tiene_dimorfismo_sexual'] as bool? ?? false,
      tieneDiferenciaJuvenil: json['tiene_diferencia_juvenil'] as bool? ?? false,
      fotos: fotos,
    );
  }

  /// Misma forma que la respuesta de Supabase, para poder cachear localmente
  /// y volver a parsear con `Especie.fromJson` sin un segundo formato.
  Map<String, dynamic> toJson() => {
    'id': id,
    'nombre_comun_es': nombreComunEs,
    'nombre_comun_en': nombreComunEn,
    'nombre_cientifico': nombreCientifico,
    'clase_taxonomica': claseTaxonomica.name,
    'familia': familia,
    'estado_conservacion': estadoConservacion?.name,
    'endemica': endemica,
    'descripcion_es': descripcionEs,
    'descripcion_en': descripcionEn,
    'habitat_es': habitatEs,
    'habitat_en': habitatEn,
    'ubicacion_breve_es': ubicacionBreveEs,
    'ubicacion_breve_en': ubicacionBreveEn,
    'sonido_url': sonidoUrl,
    'atribucion_fuente': atribucionFuente,
    'tiene_dimorfismo_sexual': tieneDimorfismoSexual,
    'tiene_diferencia_juvenil': tieneDiferenciaJuvenil,
    'especie_foto': fotos.map((f) => f.toJson()).toList(),
  };

  /// Devuelve `null` (no un string vacío) si falta la traducción, para que
  /// la UI la muestre explícitamente como pendiente en vez de una caída
  /// silenciosa al otro idioma — regla del dispatch para el toggle ES/EN.
  String? nombreComunFor(AppLanguage lang) {
    final v = lang == AppLanguage.es ? nombreComunEs : nombreComunEn;
    if (v == null || v.trim().isEmpty) return null;
    return v;
  }

  String? descripcionFor(AppLanguage lang) {
    final v = lang == AppLanguage.es ? descripcionEs : descripcionEn;
    if (v == null || v.trim().isEmpty) return null;
    return v;
  }

  String? habitatFor(AppLanguage lang) {
    final v = lang == AppLanguage.es ? habitatEs : habitatEn;
    if (v == null || v.trim().isEmpty) return null;
    return v;
  }

  String? ubicacionBreveFor(AppLanguage lang) {
    final v = lang == AppLanguage.es ? ubicacionBreveEs : ubicacionBreveEn;
    if (v == null || v.trim().isEmpty) return null;
    return v;
  }

  /// La foto marcada `es_principal` (si hay varias, la primera por orden);
  /// si ninguna está marcada, la primera foto disponible por orden.
  String? get thumbnailUrl {
    final principales = fotos.where((f) => f.esPrincipal).toList();
    if (principales.isNotEmpty) return principales.first.url;
    if (fotos.isNotEmpty) return fotos.first.url;
    return null;
  }

  /// La foto a mostrar para un tipo/slot dado (adulto/juvenil/macho/hembra):
  /// preferí la marcada `es_principal` dentro de ese tipo; si hay más de una
  /// sin marcar, la de menor `orden`. `null` si no hay ninguna — el slot
  /// queda pendiente, nunca se rellena con la foto de otro tipo.
  EspecieFoto? fotoParaTipo(FotoTipo tipo) {
    final delTipo = fotos.where((f) => f.tipo == tipo).toList()
      ..sort((a, b) {
        if (a.esPrincipal != b.esPrincipal) {
          return a.esPrincipal ? -1 : 1;
        }
        return a.orden.compareTo(b.orden);
      });
    if (delTipo.isEmpty) return null;
    return delTipo.first;
  }

  List<EspecieFoto> get otrasFotos =>
      fotos.where((f) => f.tipo == FotoTipo.otro).toList()
        ..sort((a, b) => a.orden.compareTo(b.orden));
}
