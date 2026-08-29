import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';

import '../l10n/strings.dart';
import '../theme/ticodex_theme.dart';
import 'pixel_box.dart';
import 'pixel_icons.dart';

/// Botón que reproduce el sonido característico de la especie
/// (`especie.sonido_url`). Solo se muestra en la ficha si ese campo existe
/// — no es un dato bilingüe, así que no aplica el estado "pendiente" del
/// toggle ES/EN, simplemente no hay fila de sonido si no hay `sonido_url`.
class SoundPlayerButton extends StatefulWidget {
  const SoundPlayerButton({
    super.key,
    required this.url,
    required this.language,
  });

  final String url;
  final AppLanguage language;

  @override
  State<SoundPlayerButton> createState() => _SoundPlayerButtonState();
}

class _SoundPlayerButtonState extends State<SoundPlayerButton> {
  final AudioPlayer _player = AudioPlayer();
  bool _playing = false;
  bool _loading = false;
  bool _hadError = false;

  @override
  void initState() {
    super.initState();
    _player.onPlayerComplete.listen((_) {
      if (mounted) setState(() => _playing = false);
    });
  }

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }

  Future<void> _toggle() async {
    if (_playing) {
      await _player.stop();
      if (mounted) setState(() => _playing = false);
      return;
    }
    setState(() {
      _loading = true;
      _hadError = false;
    });
    try {
      await _player.play(UrlSource(widget.url));
      if (mounted) {
        setState(() {
          _playing = true;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _loading = false;
          _hadError = true;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final strings = stringsFor(widget.language);
    final label = _hadError
        ? strings.soundError
        : (_playing ? strings.playingSound : strings.playSound);
    return GestureDetector(
      onTap: _loading ? null : _toggle,
      child: PixelBox(
        color: _playing ? TicodexColors.green : TicodexColors.cream,
        borderWidth: 3,
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            PixelIcon(
              glyph: PixelGlyph.sound,
              size: 18,
              color: _playing ? Colors.white : TicodexColors.ink,
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: pixelTextStyle(
                fontSize: 8,
                color: _hadError
                    ? TicodexColors.danger
                    : (_playing ? Colors.white : TicodexColors.ink),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
