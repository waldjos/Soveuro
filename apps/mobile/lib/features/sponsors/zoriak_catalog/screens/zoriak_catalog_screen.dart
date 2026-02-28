import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/widgets/svu_app_bar.dart';
import '../data/zoriak_products.dart';
import '../models/zoriak_product.dart';

class ZoriakCatalogScreen extends StatefulWidget {
  const ZoriakCatalogScreen({super.key});

  @override
  State<ZoriakCatalogScreen> createState() => _ZoriakCatalogScreenState();
}

class _ZoriakCatalogScreenState extends State<ZoriakCatalogScreen> {
  final _search = TextEditingController();
  String _category = 'Todos';

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  List<String> get _categories {
    final cats = kZoriakProducts.map((p) => p.category).toSet().toList()..sort();
    return ['Todos', ...cats];
  }

  List<ZoriakProduct> get _filtered {
    final q = _search.text.trim().toLowerCase();
    return kZoriakProducts.where((p) {
      final catOk = _category == 'Todos' || p.category == _category;
      if (!catOk) return false;
      if (q.isEmpty) return true;
      final haystack = '${p.brandName} ${p.activeIngredient} ${p.strength} ${p.form} ${p.pack}'.toLowerCase();
      return haystack.contains(q);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final items = _filtered;
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: const SvuAppBar(title: 'Catálogo Zoriak', showBack: true),
      body: CustomScrollView(
        slivers: [
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 10),
            sliver: SliverToBoxAdapter(
              child: TextField(
                controller: _search,
                onChanged: (_) => setState(() {}),
                decoration: InputDecoration(
                  hintText: 'Buscar por nombre o principio activo',
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: _search.text.trim().isEmpty
                      ? null
                      : IconButton(
                          onPressed: () {
                            _search.clear();
                            setState(() {});
                          },
                          icon: const Icon(Icons.close),
                        ),
                ),
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 6),
            sliver: SliverToBoxAdapter(
              child: SizedBox(
                height: 42,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: _categories.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (context, i) {
                    final c = _categories[i];
                    final selected = c == _category;
                    return ChoiceChip(
                      selected: selected,
                      onSelected: (_) => setState(() => _category = c),
                      label: Text(c),
                      selectedColor: const Color(0xFFF6D36B),
                      labelStyle: TextStyle(
                        fontWeight: FontWeight.w800,
                        color: selected ? Colors.black : cs.onSurface.withValues(alpha: 0.8),
                      ),
                      shape: const StadiumBorder(),
                      side: BorderSide(color: cs.outlineVariant.withValues(alpha: 0.8)),
                    );
                  },
                ),
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 6, 16, 0),
            sliver: SliverToBoxAdapter(
              child: Text(
                kZoriakCatalogDisclaimer,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(color: cs.onSurface.withValues(alpha: 0.65)),
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 24),
            sliver: items.isEmpty
                ? SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.only(top: 40),
                      child: Column(
                        children: [
                          Icon(Icons.inventory_2_outlined, size: 46, color: cs.onSurface.withValues(alpha: 0.5)),
                          const SizedBox(height: 10),
                          Text(
                            'Sin resultados',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Prueba con otro término o cambia el filtro.',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: cs.onSurface.withValues(alpha: 0.65)),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  )
                : SliverGrid(
                    delegate: SliverChildBuilderDelegate(
                      (context, i) => _ProductCard(product: items[i]),
                      childCount: items.length,
                    ),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 0.72,
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  const _ProductCard({required this.product});

  final ZoriakProduct product;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return InkWell(
      borderRadius: BorderRadius.circular(18),
      onTap: () => context.push('/zoriak/${product.id}'),
      child: Ink(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: cs.outlineVariant.withValues(alpha: 0.7)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
              child: AspectRatio(
                aspectRatio: 4 / 3,
                child: Image.asset(product.primaryAsset, fit: BoxFit.cover),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.brandName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${product.activeIngredient} • ${product.strength}',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(color: cs.onSurface.withValues(alpha: 0.72)),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      _Pill(text: product.category),
                      _Pill(text: product.pack),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  const _Pill({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: cs.outlineVariant.withValues(alpha: 0.7)),
      ),
      child: Text(
        text,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(fontWeight: FontWeight.w800),
      ),
    );
  }
}

