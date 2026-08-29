import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import 'pixel_icons.dart';

/// Imagen de red con `image-rendering: pixelated` (DISENO.md regla 5) vía
/// `FilterQuality.none`, cacheada en disco por `cached_network_image` para
/// no volver a pedir la misma foto en la sesión. Mientras carga o si falla,
/// muestra el ícono de foto dibujado a mano — nunca un ícono de sistema.
class PixelatedNetworkImage extends StatelessWidget {
  const PixelatedNetworkImage({
    super.key,
    required this.url,
    this.iconSize = 24,
  });

  final String url;
  final double iconSize;

  @override
  Widget build(BuildContext context) {
    return CachedNetworkImage(
      imageUrl: url,
      fit: BoxFit.cover,
      filterQuality: FilterQuality.none,
      placeholder: (_, _) =>
          Center(child: PixelIcon(glyph: PixelGlyph.photo, size: iconSize)),
      errorWidget: (_, _, _) =>
          Center(child: PixelIcon(glyph: PixelGlyph.photo, size: iconSize)),
    );
  }
}
