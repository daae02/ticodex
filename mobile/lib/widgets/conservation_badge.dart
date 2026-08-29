import 'package:flutter/material.dart';

import '../l10n/strings.dart';
import '../models/especie.dart';
import '../theme/ticodex_theme.dart';
import 'pixel_box.dart';

/// Mapeo de color por categoría UICN.
///
/// DISENO.md solo asigna color explícito a 3 de las 8 categorías: verde
/// primario para "publicado"/estado sano (lo usamos para LC), precaución
/// (#bf7b3f) para NT, y peligro (#9f001f) para "conservación crítica
/// (EN/CR)". El resto de las categorías no tenía un color asignado en el
/// documento de diseño, así que esta es una decisión de UI tomada acá:
///   - VU se agrupa con NT bajo "precaución" (mismo tono ámbar).
///   - EN y CR comparten "peligro" (mismo rojo oscuro) — se distinguen por
///     el texto del badge, no por el color.
///   - EW/EX (extinta en estado silvestre / extinta) usan el tono chrome
///     oscuro de la paleta, para separarlas visualmente de "en peligro"
///     (todavía existe) vs. "ya no existe en la naturaleza".
///   - DD (datos insuficientes) es un chip neutro (blanco/tinta) en vez de
///     un color de alerta, porque no es un nivel de riesgo, es "no sabemos".
_BadgeSpec _specFor(EstadoConservacion estado) {
  switch (estado) {
    case EstadoConservacion.LC:
      return const _BadgeSpec(TicodexColors.green, Colors.white);
    case EstadoConservacion.NT:
    case EstadoConservacion.VU:
      return const _BadgeSpec(TicodexColors.caution, Colors.white);
    case EstadoConservacion.EN:
    case EstadoConservacion.CR:
      return const _BadgeSpec(TicodexColors.danger, Colors.white);
    case EstadoConservacion.EW:
    case EstadoConservacion.EX:
      return const _BadgeSpec(TicodexColors.chrome, Colors.white);
    case EstadoConservacion.DD:
      return const _BadgeSpec(Colors.white, TicodexColors.ink);
  }
}

class _BadgeSpec {
  const _BadgeSpec(this.background, this.foreground);
  final Color background;
  final Color foreground;
}

/// Badge compacto con el código UICN (LC/NT/VU/EN/CR/EW/EX/DD), como en el
/// mockup de la lista y la ficha. El código en sí no se traduce (es un
/// estándar internacional de 2 letras) — la etiqueta completa traducida se
/// muestra aparte, ver [ConservationLabel].
class ConservationBadge extends StatelessWidget {
  const ConservationBadge({
    super.key,
    required this.estado,
    required this.language,
  });

  final EstadoConservacion? estado;
  final AppLanguage language;

  @override
  Widget build(BuildContext context) {
    final strings = stringsFor(language);
    if (estado == null) {
      return PixelBox(
        borderWidth: 2,
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
        child: Text(
          strings.noConservationData.toUpperCase(),
          style: pixelTextStyle(fontSize: 6, color: TicodexColors.ink),
        ),
      );
    }
    final spec = _specFor(estado!);
    return PixelBox(
      color: spec.background,
      borderWidth: 2,
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
      child: Text(
        estado!.name,
        style: pixelTextStyle(fontSize: 8, color: spec.foreground),
      ),
    );
  }
}

/// Texto completo y traducido del estado de conservación, para la ficha de
/// detalle (el badge de la lista solo muestra el código de 2 letras).
class ConservationLabel extends StatelessWidget {
  const ConservationLabel({
    super.key,
    required this.estado,
    required this.language,
  });

  final EstadoConservacion? estado;
  final AppLanguage language;

  @override
  Widget build(BuildContext context) {
    final strings = stringsFor(language);
    final label = estado == null
        ? strings.noConservationData
        : strings.iucnLabels[estado];
    return Text(
      '${strings.conservationStatus}: ${label ?? strings.noConservationData}',
      style: const TextStyle(fontSize: 12, color: TicodexColors.ink),
    );
  }
}
