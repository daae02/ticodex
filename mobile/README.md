# mobile

Ticodex — Pokedex de fauna de Costa Rica (catálogo de solo lectura, Fase 1/MVP).

Sin login, sin captura, sin perfil. Un solo fetch al abrir contra `especie` +
`especie_foto` (`estado_publicacion = 'publicado'`) en el proyecto Supabase
`weagfzykzqiixjyqejbc` — ver `PROYECTO.md` §2 y §8 en la raíz del repo.

## Correr la app

```
flutter pub get
flutter run -d chrome   # sin emulador/dispositivo armado, la opción más simple
flutter run -d windows  # requiere el workload "Desktop development with C++" de Visual Studio
flutter run -d android  # requiere un emulador o dispositivo Android + Android SDK instalado
```

`flutter devices` muestra qué destinos están disponibles en la máquina actual.

## Calidad

```
flutter analyze   # 0 issues
flutter test      # smoke test de arranque
```

## Estructura

- `lib/config/` — credenciales públicas de Supabase (URL + publishable key).
- `lib/models/` — `Especie`/`EspecieFoto`, reflejan `supabase/database.types.ts`.
- `lib/data/` — `EspecieRepository`: el único fetch al abrir, con caché local
  de última respuesta en `SharedPreferences` (no es sync, es solo el último
  resultado bueno para no mostrar pantalla vacía sin señal).
- `lib/state/` — `EspeciesController` (estado de carga) y `LanguageController`
  (toggle ES/EN global).
- `lib/l10n/strings.dart` — strings de interfaz en ambos idiomas (sin `.arb`,
  alcance chico).
- `lib/theme/` — paleta Amity Square y tipografía Press Start 2P
  (`DISENO.md`).
- `lib/widgets/pixel_icons.dart` — íconos dibujados a mano con `CustomPainter`
  sobre una grilla 8×8 (sin emoji ni fuentes de íconos, por regla de
  `DISENO.md`).
- `lib/screens/` — lista/grid y ficha de detalle.
