import 'package:flutter/foundation.dart';

import '../data/especie_repository.dart';
import '../models/especie.dart';

enum LoadStatus { loading, loaded, error }

/// Guarda el resultado del único fetch al abrir la app. No hay
/// pull-to-refresh ni recarga periódica en esta fase — `reload()` solo lo
/// dispara el botón de reintentar cuando el fetch inicial falla sin caché.
class EspeciesController extends ChangeNotifier {
  EspeciesController(this._repository);

  final EspecieRepository _repository;

  LoadStatus status = LoadStatus.loading;
  List<Especie> especies = const [];
  bool fromCache = false;
  Object? error;

  Future<void> load() async {
    status = LoadStatus.loading;
    error = null;
    notifyListeners();
    try {
      final result = await _repository.fetchEspecies();
      especies = result.especies;
      fromCache = result.fromCache;
      status = LoadStatus.loaded;
    } catch (e) {
      status = LoadStatus.error;
      error = e;
    }
    notifyListeners();
  }
}
