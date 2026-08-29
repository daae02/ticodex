import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'config/supabase_config.dart';
import 'data/especie_repository.dart';
import 'screens/species_list_screen.dart';
import 'state/especies_controller.dart';
import 'state/language_controller.dart';
import 'theme/ticodex_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final prefs = await SharedPreferences.getInstance();

  await Supabase.initialize(
    url: SupabaseConfig.url,
    publishableKey: SupabaseConfig.publishableKey,
  );

  runApp(TicodexApp(prefs: prefs));
}

/// Ticodex, Fase 1: catálogo de especies de solo lectura, sin login. Un solo
/// fetch al abrir la app (disparado acá, una vez, al crear el
/// `EspeciesController`) — ver PROYECTO.md §2.1 y §8.
class TicodexApp extends StatelessWidget {
  const TicodexApp({super.key, required this.prefs});

  final SharedPreferences prefs;

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => LanguageController()),
        ChangeNotifierProvider(
          create: (_) => EspeciesController(
            EspecieRepository(Supabase.instance.client, prefs),
          )..load(),
        ),
      ],
      child: MaterialApp(
        title: 'Ticodex',
        debugShowCheckedModeBanner: false,
        theme: buildTicodexTheme(),
        home: const SpeciesListScreen(),
      ),
    );
  }
}
