import 'package:flutter/foundation.dart';

import '../l10n/strings.dart';

/// Idioma activo, global a toda la app (lista + ficha). Sin persistencia
/// entre sesiones por ahora — no estaba pedido y agregarlo sería una
/// decisión de producto (recordar preferencia) fuera de este alcance.
class LanguageController extends ChangeNotifier {
  AppLanguage _language = AppLanguage.es;

  AppLanguage get language => _language;

  void set(AppLanguage lang) {
    if (_language == lang) return;
    _language = lang;
    notifyListeners();
  }

  void toggle() {
    set(_language == AppLanguage.es ? AppLanguage.en : AppLanguage.es);
  }
}
