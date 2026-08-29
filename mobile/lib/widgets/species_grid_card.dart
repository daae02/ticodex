import 'package:flutter/material.dart';

import '../l10n/strings.dart';
import '../models/especie.dart';
import '../theme/ticodex_theme.dart';
import 'conservation_badge.dart';
import 'pixel_box.dart';
import 'pixel_icons.dart';
import 'pixelated_network_image.dart';

/// Tarjeta de la grilla de la pantalla principal: foto, nombre (común +
/// científico) y badge UICN — como en el mockup "1. LISTA DE ESPECIES".
class SpeciesGridCard extends StatelessWidget {
  const SpeciesGridCard({
    super.key,
    required this.especie,
    required this.language,
    required this.altBackground,
    required this.onTap,
  });

  final Especie especie;
  final AppLanguage language;
  final bool altBackground;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final strings = stringsFor(language);
    final thumb = especie.thumbnailUrl;
    final nombreComun = especie.nombreComunFor(language);

    return GestureDetector(
      onTap: onTap,
      child: PixelBox(
        color: altBackground ? TicodexColors.lavender : TicodexColors.cream,
        borderWidth: 3,
        padding: const EdgeInsets.all(6),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Container(
                width: double.infinity,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  border: Border.fromBorderSide(
                    BorderSide(color: TicodexColors.ink, width: 2),
                  ),
                ),
                child: thumb == null
                    ? const Center(
                        child: PixelIcon(glyph: PixelGlyph.photo, size: 28),
                      )
                    : PixelatedNetworkImage(url: thumb, iconSize: 24),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              nombreComun ?? strings.translationPending,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 11,
                color: TicodexColors.ink,
                fontStyle: nombreComun == null
                    ? FontStyle.italic
                    : FontStyle.normal,
              ),
            ),
            Text(
              especie.nombreCientifico,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontStyle: FontStyle.italic,
                fontSize: 9,
                color: TicodexColors.ink,
              ),
            ),
            const SizedBox(height: 4),
            ConservationBadge(
              estado: especie.estadoConservacion,
              language: language,
            ),
          ],
        ),
      ),
    );
  }
}
