import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../l10n/strings.dart';
import '../models/especie.dart';
import '../state/language_controller.dart';
import '../theme/ticodex_theme.dart';
import '../widgets/conservation_badge.dart';
import '../widgets/language_toggle.dart';
import '../widgets/photo_slot.dart';
import '../widgets/pixel_box.dart';
import '../widgets/pixel_icons.dart';
import '../widgets/pixelated_network_image.dart';
import '../widgets/sound_player_button.dart';

/// Ficha de especie (Programa 1, PROYECTO.md §8.2): bilingüe ES/EN, fotos
/// por tipo, sonido característico, descripción, hábitat, ubicación breve y
/// badge de conservación UICN. Sin captura ni "marcar visto" — Fase 2.
class SpeciesDetailScreen extends StatelessWidget {
  const SpeciesDetailScreen({super.key, required this.especie});

  final Especie especie;

  @override
  Widget build(BuildContext context) {
    final language = context.watch<LanguageController>().language;
    final strings = stringsFor(language);
    final nombreComun = especie.nombreComunFor(language);
    final descripcion = especie.descripcionFor(language);
    final habitat = especie.habitatFor(language);
    final ubicacion = especie.ubicacionBreveFor(language);
    final mainPhoto = especie.thumbnailUrl;

    return Scaffold(
      appBar: AppBar(
        leading: null,
        automaticallyImplyLeading: false,
        titleSpacing: 8,
        title: TextButton(
          onPressed: () => Navigator.of(context).pop(),
          style: TextButton.styleFrom(padding: EdgeInsets.zero),
          child: Text(strings.back, style: pixelTextStyle(fontSize: 9, color: Colors.white)),
        ),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 12),
            child: Center(child: LanguageToggle()),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                height: 200,
                width: double.infinity,
                decoration: const BoxDecoration(
                  color: TicodexColors.lavender,
                  border: Border.fromBorderSide(
                    BorderSide(color: TicodexColors.ink, width: 3),
                  ),
                ),
                child: mainPhoto == null
                    ? const Center(
                        child: PixelIcon(glyph: PixelGlyph.photo, size: 40),
                      )
                    : PixelatedNetworkImage(url: mainPhoto, iconSize: 32),
              ),
              const SizedBox(height: 12),
              Text(
                nombreComun ?? strings.translationPending,
                style: pixelTextStyle(
                  fontSize: 13,
                  color: TicodexColors.ink,
                ).copyWith(
                  fontStyle: nombreComun == null
                      ? FontStyle.italic
                      : FontStyle.normal,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                especie.nombreCientifico,
                style: const TextStyle(
                  fontStyle: FontStyle.italic,
                  fontSize: 14,
                  color: TicodexColors.ink,
                ),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  ConservationBadge(
                    estado: especie.estadoConservacion,
                    language: language,
                  ),
                  _Chip(strings.claseLabels[especie.claseTaxonomica] ?? ''),
                  if (especie.familia != null && especie.familia!.trim().isNotEmpty)
                    _Chip(especie.familia!),
                  if (especie.endemica) _Chip(strings.endemicLabel),
                ],
              ),
              const SizedBox(height: 6),
              ConservationLabel(
                estado: especie.estadoConservacion,
                language: language,
              ),
              if (especie.sonidoUrl != null &&
                  especie.sonidoUrl!.trim().isNotEmpty) ...[
                const SizedBox(height: 14),
                SoundPlayerButton(url: especie.sonidoUrl!, language: language),
              ],
              const SizedBox(height: 18),
              _Section(
                title: strings.descriptionTitle,
                body: descripcion,
                pendingLabel: strings.translationPending,
              ),
              const SizedBox(height: 14),
              _Section(
                title: strings.habitatTitle,
                body: habitat,
                pendingLabel: strings.translationPending,
              ),
              const SizedBox(height: 14),
              _Section(
                title: strings.locationTitle,
                body: ubicacion,
                pendingLabel: strings.translationPending,
              ),
              if (especie.atribucionFuente != null &&
                  especie.atribucionFuente!.trim().isNotEmpty) ...[
                const SizedBox(height: 10),
                Text(
                  especie.atribucionFuente!,
                  style: TextStyle(
                    fontSize: 10,
                    height: 1.3,
                    color: TicodexColors.ink.withValues(alpha: 0.55),
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ],
              const SizedBox(height: 18),
              Text(
                strings.photosTitle,
                style: pixelTextStyle(fontSize: 10, color: TicodexColors.ink),
              ),
              const SizedBox(height: 10),
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 10,
                crossAxisSpacing: 10,
                childAspectRatio: 0.85,
                children: fotoSlotsFor(especie)
                    .map(
                      (tipo) => PhotoSlot(
                        label: strings.tipoFotoLabels[tipo] ?? tipo.name,
                        foto: especie.fotoParaTipo(tipo),
                        pendingLabel: strings.photoPending,
                      ),
                    )
                    .toList(),
              ),
              if (especie.otrasFotos.isNotEmpty) ...[
                const SizedBox(height: 18),
                Text(
                  strings.otherPhotosTitle,
                  style: pixelTextStyle(
                    fontSize: 10,
                    color: TicodexColors.ink,
                  ),
                ),
                const SizedBox(height: 10),
                SizedBox(
                  height: 110,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: especie.otrasFotos.length,
                    separatorBuilder: (_, _) => const SizedBox(width: 10),
                    itemBuilder: (context, index) {
                      final foto = especie.otrasFotos[index];
                      return Container(
                        width: 110,
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          border: Border.fromBorderSide(
                            BorderSide(color: TicodexColors.ink, width: 3),
                          ),
                        ),
                        child: PixelatedNetworkImage(url: foto.url),
                      );
                    },
                  ),
                ),
              ],
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({
    required this.title,
    required this.body,
    required this.pendingLabel,
  });

  final String title;
  final String? body;
  final String pendingLabel;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: pixelTextStyle(fontSize: 9, color: TicodexColors.ink),
        ),
        const SizedBox(height: 6),
        Text(
          body ?? pendingLabel,
          style: TextStyle(
            fontSize: 13,
            height: 1.4,
            color: TicodexColors.ink,
            fontStyle: body == null ? FontStyle.italic : FontStyle.normal,
          ),
        ),
      ],
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip(this.label);

  final String label;

  @override
  Widget build(BuildContext context) {
    return PixelBox(
      borderWidth: 2,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: Text(
        label.toUpperCase(),
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.bold,
          color: TicodexColors.ink,
        ),
      ),
    );
  }
}
