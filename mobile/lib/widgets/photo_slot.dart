import 'package:flutter/material.dart';

import '../models/especie.dart';
import '../theme/ticodex_theme.dart';
import 'pixel_icons.dart';
import 'pixelated_network_image.dart';

/// Un slot de foto por tipo (adulto/juvenil/macho/hembra) en la ficha. Si
/// `foto` es `null`, el espacio queda explícitamente marcado como
/// pendiente — nunca se rellena con la foto de otro tipo (regla del
/// dispatch y callout 1 del mockup de ficha).
class PhotoSlot extends StatelessWidget {
  const PhotoSlot({
    super.key,
    required this.label,
    required this.foto,
    required this.pendingLabel,
  });

  final String label;
  final EspecieFoto? foto;
  final String pendingLabel;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        AspectRatio(
          aspectRatio: 1,
          child: Container(
            decoration: BoxDecoration(
              color: foto == null ? TicodexColors.lavender : Colors.white,
              border: Border.all(color: TicodexColors.ink, width: 3),
            ),
            child: foto == null
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const PixelIcon(
                          glyph: PixelGlyph.photo,
                          size: 22,
                          color: TicodexColors.ink,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          pendingLabel,
                          style: pixelTextStyle(
                            fontSize: 6,
                            color: TicodexColors.ink,
                          ),
                        ),
                      ],
                    ),
                  )
                : PixelatedNetworkImage(url: foto!.url, iconSize: 20),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          textAlign: TextAlign.center,
          style: pixelTextStyle(fontSize: 7, color: TicodexColors.ink),
        ),
      ],
    );
  }
}
