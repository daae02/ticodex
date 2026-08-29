import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Paleta "Amity Square" con los roles asignados en DISENO.md. No son todos
/// los 30 colores de la paleta — solo los que tienen un rol de UI definido.
class TicodexColors {
  const TicodexColors._();

  static const background = Color(0xFFFFFFFF);
  static const cream = Color(0xFFFFFFBF);
  static const lavender = Color(0xFFCFBFDF);
  static const chrome = Color(0xFF36365E);
  static const ink = Color(0xFF302040);
  static const green = Color(0xFF28B851);
  static const greenDark = Color(0xFF3D8472);
  static const accent = Color(0xFFFF4040);
  static const danger = Color(0xFF9F001F);
  static const caution = Color(0xFFBF7B3F);
  static const info = Color(0xFF2382C1);
}

/// Títulos, labels cortos y botones usan Press Start 2P (DISENO.md §Tipografía).
/// Nunca para párrafos largos — para eso se usa el sans-serif del sistema
/// (el `TextTheme` por defecto de Material, sin tocar `fontFamily` base).
TextStyle pixelTextStyle({
  double fontSize = 10,
  Color color = TicodexColors.ink,
  double height = 1.5,
}) {
  return GoogleFonts.pressStart2p(
    fontSize: fontSize,
    color: color,
    height: height,
  );
}

ThemeData buildTicodexTheme() {
  final base = ThemeData(useMaterial3: true);

  return base.copyWith(
    scaffoldBackgroundColor: TicodexColors.background,
    colorScheme: base.colorScheme.copyWith(
      primary: TicodexColors.green,
      onPrimary: Colors.white,
      secondary: TicodexColors.info,
      surface: TicodexColors.background,
      error: TicodexColors.danger,
    ),
    splashFactory: NoSplash.splashFactory,
    highlightColor: Colors.transparent,
    appBarTheme: AppBarTheme(
      backgroundColor: TicodexColors.chrome,
      foregroundColor: Colors.white,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: pixelTextStyle(fontSize: 12, color: Colors.white),
      shape: const Border(
        bottom: BorderSide(color: TicodexColors.ink, width: 4),
      ),
    ),
    // Reglas de pixel art: sin esquinas redondeadas en ningún componente.
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: TicodexColors.green,
        foregroundColor: Colors.white,
        elevation: 0,
        shape: const RoundedRectangleBorder(),
        side: const BorderSide(color: TicodexColors.ink, width: 3),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        textStyle: pixelTextStyle(fontSize: 9, color: Colors.white),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: Colors.white,
        shape: const RoundedRectangleBorder(),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(
        horizontal: 10,
        vertical: 10,
      ),
      border: const OutlineInputBorder(
        borderRadius: BorderRadius.zero,
        borderSide: BorderSide(color: TicodexColors.ink, width: 3),
      ),
      enabledBorder: const OutlineInputBorder(
        borderRadius: BorderRadius.zero,
        borderSide: BorderSide(color: TicodexColors.ink, width: 3),
      ),
      focusedBorder: const OutlineInputBorder(
        borderRadius: BorderRadius.zero,
        borderSide: BorderSide(color: TicodexColors.green, width: 3),
      ),
    ),
  );
}
