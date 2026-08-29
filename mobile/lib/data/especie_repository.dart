import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/especie.dart';

/// Resultado de un intento de fetch: la lista de especies y si vinieron del
/// caché local (porque el fetch en vivo falló) o del backend recién.
class EspecieFetchResult {
  const EspecieFetchResult({required this.especies, required this.fromCache});

  final List<Especie> especies;
  final bool fromCache;
}

/// Fase 1: un solo fetch al abrir la app contra `especie` + `especie_foto`
/// con `estado_publicacion = publicado`. No hay paginación por región, ni
/// refresco continuo, ni cola de sincronización — eso es fuera de alcance.
///
/// El único "cacheo" que hace esta clase es guardar el último resultado
/// bueno en `SharedPreferences` para no dejar la pantalla vacía si se abre
/// sin señal. No es una cola de sync: es solo la última respuesta leída.
class EspecieRepository {
  EspecieRepository(this._client, this._prefs);

  final SupabaseClient _client;
  final SharedPreferences _prefs;

  static const _cacheKey = 'ticodex_especies_cache_v1';
  static const _fetchTimeout = Duration(seconds: 12);

  Future<EspecieFetchResult> fetchEspecies() async {
    try {
      final data = await _client
          .from('especie')
          .select('*, especie_foto(*)')
          .eq('estado_publicacion', 'publicado')
          .order('nombre_comun_es')
          .timeout(_fetchTimeout);

      final especies = (data as List<dynamic>)
          .map((row) => Especie.fromJson(row as Map<String, dynamic>))
          .toList();

      await _saveCache(especies);
      return EspecieFetchResult(especies: especies, fromCache: false);
    } catch (_) {
      final cached = _loadCache();
      if (cached != null) {
        return EspecieFetchResult(especies: cached, fromCache: true);
      }
      rethrow;
    }
  }

  Future<void> _saveCache(List<Especie> especies) async {
    final raw = jsonEncode(especies.map((e) => e.toJson()).toList());
    await _prefs.setString(_cacheKey, raw);
  }

  List<Especie>? _loadCache() {
    final raw = _prefs.getString(_cacheKey);
    if (raw == null) return null;
    try {
      final decoded = jsonDecode(raw) as List<dynamic>;
      return decoded
          .map((e) => Especie.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (_) {
      return null;
    }
  }
}
