import 'package:flutter/material.dart';

import '../theme/ticodex_theme.dart';

/// Contenedor base del lenguaje visual: contorno duro de N px en
/// `TicodexColors.ink`, sin esquinas redondeadas, y una sombra "dura"
/// desplazada opcional (offset sólido, sin blur) — DISENO.md §Reglas de
/// pixel art, puntos 2-4.
class PixelBox extends StatelessWidget {
  const PixelBox({
    super.key,
    required this.child,
    this.color = Colors.white,
    this.borderWidth = 3,
    this.shadowOffset = 0,
    this.padding = const EdgeInsets.all(8),
    this.margin,
  });

  final Widget child;
  final Color color;
  final double borderWidth;
  final double shadowOffset;
  final EdgeInsetsGeometry padding;
  final EdgeInsetsGeometry? margin;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: margin,
      padding: padding,
      decoration: BoxDecoration(
        color: color,
        border: Border.all(color: TicodexColors.ink, width: borderWidth),
        boxShadow: shadowOffset > 0
            ? [
                BoxShadow(
                  color: TicodexColors.ink,
                  offset: Offset(shadowOffset, shadowOffset),
                  blurRadius: 0,
                  spreadRadius: 0,
                ),
              ]
            : null,
      ),
      child: child,
    );
  }
}
