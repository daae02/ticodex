// Smoke test: la app arranca y muestra la barra superior sin tirar
// excepciones, incluso antes de que el fetch a Supabase resuelva (no se
// espera señal en el entorno de test).

import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:mobile/config/supabase_config.dart';
import 'package:mobile/main.dart';

void main() {
  testWidgets('Ticodex arranca y muestra el título en la barra superior', (
    WidgetTester tester,
  ) async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    await Supabase.initialize(
      url: SupabaseConfig.url,
      publishableKey: SupabaseConfig.publishableKey,
      // Sin esto, GoTrue arranca un timer de auto-refresh que sigue vivo
      // después de que el widget tree del test se destruye.
      authOptions: const FlutterAuthClientOptions(autoRefreshToken: false),
    );

    await tester.pumpWidget(TicodexApp(prefs: prefs));
    await tester.pump();

    expect(find.text('TICODEX'), findsOneWidget);
  });
}
