import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../l10n/strings.dart';
import '../state/language_controller.dart';
import '../theme/ticodex_theme.dart';

/// Toggle "ES | EN" en la barra superior — global a lista y ficha (ver nota
/// en `LanguageController`). Estilo segmentado pixel, sin curvas.
class LanguageToggle extends StatelessWidget {
  const LanguageToggle({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<LanguageController>();
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: Colors.white, width: 2),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _Option(
            label: 'ES',
            active: controller.language == AppLanguage.es,
            onTap: () => controller.set(AppLanguage.es),
          ),
          _Option(
            label: 'EN',
            active: controller.language == AppLanguage.en,
            onTap: () => controller.set(AppLanguage.en),
          ),
        ],
      ),
    );
  }
}

class _Option extends StatelessWidget {
  const _Option({
    required this.label,
    required this.active,
    required this.onTap,
  });

  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
        color: active ? TicodexColors.green : Colors.transparent,
        child: Text(
          label,
          style: pixelTextStyle(fontSize: 8, color: Colors.white),
        ),
      ),
    );
  }
}
