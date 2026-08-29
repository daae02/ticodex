import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../l10n/strings.dart';
import '../models/especie.dart';
import '../state/especies_controller.dart';
import '../state/language_controller.dart';
import '../theme/ticodex_theme.dart';
import '../widgets/language_toggle.dart';
import '../widgets/pixel_box.dart';
import '../widgets/pixel_icons.dart';
import '../widgets/species_grid_card.dart';
import 'species_detail_screen.dart';

/// Pantalla de entrada (Programa 1, PROYECTO.md §8.1): sin login, un solo
/// fetch al abrir que ya disparó `EspeciesController` desde `main.dart`,
/// grid navegable por nombre común/científico. Tap en una tarjeta abre la
/// ficha de detalle.
class SpeciesListScreen extends StatefulWidget {
  const SpeciesListScreen({super.key});

  @override
  State<SpeciesListScreen> createState() => _SpeciesListScreenState();
}

class _SpeciesListScreenState extends State<SpeciesListScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _query = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<Especie> _filter(List<Especie> all) {
    final q = _query.trim().toLowerCase();
    if (q.isEmpty) return all;
    return all.where((e) {
      final es = e.nombreComunEs.toLowerCase();
      final en = (e.nombreComunEn ?? '').toLowerCase();
      final cientifico = e.nombreCientifico.toLowerCase();
      return es.contains(q) || en.contains(q) || cientifico.contains(q);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final language = context.watch<LanguageController>().language;
    final especiesController = context.watch<EspeciesController>();
    final strings = stringsFor(language);

    return Scaffold(
      appBar: AppBar(
        title: Text(strings.appTitle),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 12),
            child: Center(child: LanguageToggle()),
          ),
        ],
      ),
      body: SafeArea(
        child: _buildBody(context, especiesController, language, strings),
      ),
    );
  }

  Widget _buildBody(
    BuildContext context,
    EspeciesController controller,
    AppLanguage language,
    AppStrings strings,
  ) {
    switch (controller.status) {
      case LoadStatus.loading:
        return _LoadingView(strings: strings);
      case LoadStatus.error:
        return _ErrorView(
          strings: strings,
          onRetry: controller.load,
        );
      case LoadStatus.loaded:
        final filtered = _filter(controller.especies);
        return Column(
          children: [
            if (controller.fromCache) _OfflineBanner(strings: strings),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 12, 12, 6),
              child: _SearchField(
                controller: _searchController,
                hint: strings.searchHint,
                onChanged: (v) => setState(() => _query = v),
              ),
            ),
            Expanded(
              child: controller.especies.isEmpty
                  ? _MessageView(message: strings.emptyCatalog)
                  : (filtered.isEmpty
                        ? _MessageView(message: strings.emptySearch)
                        : GridView.builder(
                            padding: const EdgeInsets.fromLTRB(12, 0, 12, 16),
                            gridDelegate:
                                const SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: 2,
                                  mainAxisSpacing: 12,
                                  crossAxisSpacing: 12,
                                  childAspectRatio: 0.68,
                                ),
                            itemCount: filtered.length,
                            itemBuilder: (context, index) {
                              final especie = filtered[index];
                              return SpeciesGridCard(
                                especie: especie,
                                language: language,
                                altBackground: index.isOdd,
                                onTap: () => Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) =>
                                        SpeciesDetailScreen(especie: especie),
                                  ),
                                ),
                              );
                            },
                          )),
            ),
          ],
        );
    }
  }
}

class _SearchField extends StatelessWidget {
  const _SearchField({
    required this.controller,
    required this.hint,
    required this.onChanged,
  });

  final TextEditingController controller;
  final String hint;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      onChanged: onChanged,
      decoration: InputDecoration(
        hintText: hint,
        prefixIcon: const Padding(
          padding: EdgeInsets.all(10),
          child: PixelIcon(glyph: PixelGlyph.search, size: 16),
        ),
      ),
    );
  }
}

class _LoadingView extends StatelessWidget {
  const _LoadingView({required this.strings});

  final AppStrings strings;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(
            width: 28,
            height: 28,
            child: CircularProgressIndicator(
              strokeWidth: 3,
              color: TicodexColors.green,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            strings.loading,
            style: pixelTextStyle(fontSize: 9, color: TicodexColors.ink),
          ),
        ],
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.strings, required this.onRetry});

  final AppStrings strings;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: PixelBox(
          color: TicodexColors.cream,
          borderWidth: 3,
          shadowOffset: 4,
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                strings.errorTitle,
                textAlign: TextAlign.center,
                style: pixelTextStyle(fontSize: 10, color: TicodexColors.ink),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: onRetry,
                child: Text(strings.retry),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MessageView extends StatelessWidget {
  const _MessageView({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Text(
          message,
          textAlign: TextAlign.center,
          style: const TextStyle(color: TicodexColors.ink, fontSize: 13),
        ),
      ),
    );
  }
}

class _OfflineBanner extends StatelessWidget {
  const _OfflineBanner({required this.strings});

  final AppStrings strings;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      color: TicodexColors.caution,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: Text(
        strings.offlineBanner,
        textAlign: TextAlign.center,
        style: pixelTextStyle(fontSize: 7, color: Colors.white),
      ),
    );
  }
}
