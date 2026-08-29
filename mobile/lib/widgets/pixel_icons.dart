import 'package:flutter/material.dart';

import '../theme/ticodex_theme.dart';

/// DISENO.md es explícito: "Nunca emoji ni pictogramas Unicode como ícono
/// [...] Todo ícono se dibuja como forma pixel (bloques cuadrados), no como
/// carácter Unicode." Los pocos íconos que necesita la app (foto/placeholder,
/// sonido, búsqueda) se dibujan acá celda por celda sobre una grilla 8x8,
/// pintados con `Canvas.drawRect` — nada de fuentes de íconos ni emoji.
enum PixelGlyph { photo, sound, search }

const int _gridSize = 8;

/// Triángulo "escalón" (nunca curvas, regla de pixel art) con el vértice en
/// (apexCol, apexRow) creciendo hacia abajo `height` filas.
Set<(int, int)> _stepTriangleDown({
  required int apexCol,
  required int apexRow,
  required int height,
}) {
  final cells = <(int, int)>{};
  for (var i = 0; i < height; i++) {
    final row = apexRow + i;
    final start = apexCol - i;
    final width = 2 * i + 1;
    for (var c = start; c < start + width; c++) {
      if (c >= 0 && c < _gridSize && row >= 0 && row < _gridSize) {
        cells.add((c, row));
      }
    }
  }
  return cells;
}

Set<(int, int)> _rect(int c0, int c1, int r0, int r1) {
  final cells = <(int, int)>{};
  for (var c = c0; c <= c1; c++) {
    for (var r = r0; r <= r1; r++) {
      cells.add((c, r));
    }
  }
  return cells;
}

/// Foto de paisaje pixelada: sol + dos montañas + línea de base. Se usa como
/// placeholder de miniatura y como marcador de "foto pendiente" en los slots
/// de la ficha.
Set<(int, int)> _photoCells() {
  return {
    ..._stepTriangleDown(apexCol: 2, apexRow: 3, height: 4),
    ..._stepTriangleDown(apexCol: 5, apexRow: 4, height: 3),
    (6, 0), // sol
    ..._rect(0, 7, 7, 7), // línea de base
  };
}

/// Parlante con "bocina" que se ensancha y dos barras de onda de sonido.
Set<(int, int)> _soundCells() {
  return {
    ..._rect(0, 1, 2, 5), // caja del parlante
    ..._rect(2, 2, 2, 5),
    ..._rect(3, 3, 1, 6),
    ..._rect(4, 4, 0, 7), // bocina, se abre hacia afuera
    ..._rect(6, 6, 3, 4), // onda chica
    ..._rect(7, 7, 2, 5), // onda grande
  };
}

/// Lupa: anillo cuadrado (marco menos el hueco interior) + mango diagonal.
Set<(int, int)> _searchCells() {
  final ring = _rect(1, 4, 1, 4).difference(_rect(2, 3, 2, 3));
  return {...ring, (5, 5), (6, 6), (7, 7)};
}

Set<(int, int)> _cellsFor(PixelGlyph glyph) {
  switch (glyph) {
    case PixelGlyph.photo:
      return _photoCells();
    case PixelGlyph.sound:
      return _soundCells();
    case PixelGlyph.search:
      return _searchCells();
  }
}

class PixelIcon extends StatelessWidget {
  const PixelIcon({
    super.key,
    required this.glyph,
    this.size = 20,
    this.color = TicodexColors.ink,
  });

  final PixelGlyph glyph;
  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _PixelGlyphPainter(cells: _cellsFor(glyph), color: color),
      ),
    );
  }
}

class _PixelGlyphPainter extends CustomPainter {
  const _PixelGlyphPainter({required this.cells, required this.color});

  final Set<(int, int)> cells;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = color;
    final cellW = size.width / _gridSize;
    final cellH = size.height / _gridSize;
    for (final (col, row) in cells) {
      canvas.drawRect(
        Rect.fromLTWH(col * cellW, row * cellH, cellW, cellH),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _PixelGlyphPainter oldDelegate) {
    return oldDelegate.color != color || oldDelegate.cells != cells;
  }
}
