import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/doctors_provider.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/svu_app_bar.dart';
import '../../events/data/local_events.dart';

class DoctorsListScreen extends ConsumerStatefulWidget {
  const DoctorsListScreen({super.key});

  @override
  ConsumerState<DoctorsListScreen> createState() => _DoctorsListScreenState();
}

class _DoctorsListScreenState extends ConsumerState<DoctorsListScreen> {
  List<dynamic> _items = [];
  String _query = '';
  int _page = 1;
  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (_loading) return;
    setState(() => _loading = true);
    _error = null;
    try {
      final data = await ref.read(doctorsRepositoryProvider).list(page: _page, limit: 20);
      setState(() {
        _items = data['items'] as List<dynamic>? ?? [];
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final items = _query.trim().isEmpty
        ? _items
        : _items.where((raw) {
            final d = raw is Map<String, dynamic> ? raw : <String, dynamic>{};
            final name = (d['fullName'] as String? ?? '').toLowerCase();
            final spec = (d['specialty'] as String? ?? '').toLowerCase();
            final city = (d['city'] as String? ?? '').toLowerCase();
            final q = _query.trim().toLowerCase();
            return name.contains(q) || spec.contains(q) || city.contains(q);
          }).toList();

    return Scaffold(
      appBar: const SvuAppBar(title: 'Bienvenidos'),
      body: _error != null
          ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [Text(_error!), const SizedBox(height: 16), FilledButton(onPressed: _load, child: const Text('Reintentar'))]))
          : _loading && _items.isEmpty
              ? const Center(child: CircularProgressIndicator())
              : RefreshIndicator(
                  onRefresh: () async {
                    _page = 1;
                    await _load();
                  },
                  child: CustomScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    slivers: [
                      const SliverToBoxAdapter(
                        child: Padding(
                          padding: EdgeInsets.fromLTRB(16, 16, 16, 10),
                          child: _ZoriakBannerCard(),
                        ),
                      ),
                      SliverToBoxAdapter(
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                          child: TextField(
                            onChanged: (v) => setState(() => _query = v),
                            decoration: const InputDecoration(
                              hintText: 'Buscar doctores, especialidades, sedes…',
                              prefixIcon: Icon(Icons.search),
                            ),
                          ),
                        ),
                      ),
                      const SliverToBoxAdapter(
                        child: Padding(
                          padding: EdgeInsets.fromLTRB(16, 0, 16, 8),
                          child: Wrap(
                            spacing: 10,
                            runSpacing: 10,
                            children: <Widget>[
                              _Chip(label: 'Todo', selected: true),
                              _Chip(label: 'Sedes'),
                              _Chip(label: 'Doctores'),
                            ],
                          ),
                        ),
                      ),
                      const SliverToBoxAdapter(
                        child: Padding(
                          padding: EdgeInsets.fromLTRB(16, 10, 16, 8),
                          child: _SectionTitle(title: 'Próximos Eventos'),
                        ),
                      ),
                      const SliverToBoxAdapter(
                        child: Padding(
                          padding: EdgeInsets.fromLTRB(16, 0, 16, 16),
                          child: _UpcomingEventsCard(),
                        ),
                      ),
                      const SliverToBoxAdapter(
                        child: Padding(
                          padding: EdgeInsets.fromLTRB(16, 0, 16, 8),
                          child: _SectionTitle(title: 'Doctores'),
                        ),
                      ),
                      if (items.isEmpty && !_loading)
                        SliverFillRemaining(
                          hasScrollBody: false,
                          child: EmptyState(
                            title: 'No hay doctores para mostrar',
                            message: 'Aún no hay doctores registrados o no hay coincidencias con tu búsqueda.',
                            icon: Icons.medical_services_outlined,
                            action: FilledButton(
                              onPressed: _load,
                              child: const Text('Recargar'),
                            ),
                          ),
                        )
                      else
                        SliverList.builder(
                          itemCount: items.length + (_loading ? 1 : 0),
                          itemBuilder: (context, i) {
                            if (_loading && i == items.length) {
                              return const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator()));
                            }
                            final d = items[i] as Map<String, dynamic>;
                            final name = d['fullName'] as String? ?? '';
                            final specialty = d['specialty'] as String? ?? '';
                            final city = d['city'] as String?;
                            return Card(
                              margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(18),
                                side: BorderSide(color: Colors.black.withValues(alpha: 0.06)),
                              ),
                              child: Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                child: Row(
                                  children: [
                                    _AvatarCircle(letter: name.isNotEmpty ? name.substring(0, 1).toUpperCase() : '?'),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              Expanded(
                                                child: Text(
                                                  name,
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                  style: const TextStyle(fontWeight: FontWeight.w900),
                                                ),
                                              ),
                                              if (d['verified'] == true) ...[
                                                const SizedBox(width: 8),
                                                const Icon(Icons.verified, color: Colors.blue, size: 18),
                                              ],
                                            ],
                                          ),
                                          const SizedBox(height: 2),
                                          Text(
                                            [specialty, if (city != null) city].where((s) => s.isNotEmpty).join(' · '),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                            style: TextStyle(color: Colors.black.withValues(alpha: 0.60)),
                                          ),
                                          const SizedBox(height: 10),
                                          Align(
                                            alignment: Alignment.centerLeft,
                                            child: FilledButton(
                                              onPressed: () => context.push('/doctors/${d['id']}'),
                                              style: FilledButton.styleFrom(
                                                backgroundColor: const Color(0xFFF6D36B),
                                                foregroundColor: Colors.black,
                                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                                shape: const StadiumBorder(),
                                                textStyle: const TextStyle(fontWeight: FontWeight.w800),
                                              ),
                                              child: const Text('Cuéntame…'),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                    Column(
                                      children: [
                                        _ActionIcon(
                                          icon: Icons.phone_rounded,
                                          onTap: () {},
                                        ),
                                        const SizedBox(height: 10),
                                        _ActionIcon(
                                          icon: Icons.chevron_right_rounded,
                                          onTap: () => context.push('/doctors/${d['id']}'),
                                          filled: false,
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                        ),
                      );
                    },
                        ),
                    ],
                  ),
                ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
          ),
        ),
      ],
    );
  }
}

class _UpcomingEventsCard extends StatelessWidget {
  const _UpcomingEventsCard();

  @override
  Widget build(BuildContext context) {
    final first = kLocalEvents.isNotEmpty ? kLocalEvents.first : null;
    return Container(
      height: 92,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.black.withValues(alpha: 0.06)),
      ),
      child: InkWell(
        onTap: () => context.go('/events'),
        borderRadius: BorderRadius.circular(18),
        child: Row(
          children: [
            const SizedBox(width: 12),
            if (first != null)
              ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: Image.asset(
                  first.assetPath,
                  width: 64,
                  height: 64,
                  fit: BoxFit.cover,
                ),
              )
            else
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.22),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(Icons.event_rounded, color: Colors.black54),
              ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    first?.title ?? 'Eventos',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    first?.dateLabel ?? 'Ver próximos eventos',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.black54),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded),
            const SizedBox(width: 10),
          ],
        ),
      ),
    );
  }
}

class _ZoriakBannerCard extends StatelessWidget {
  const _ZoriakBannerCard();

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => context.go('/zoriak'),
      borderRadius: BorderRadius.circular(18),
      child: Ink(
        height: 138,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: Colors.black.withValues(alpha: 0.06)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 18,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(18),
          child: Stack(
            fit: StackFit.expand,
            children: [
              Image.asset('assets/sponsors/zoriak_banner.png', fit: BoxFit.cover),
              DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.black.withValues(alpha: 0.00),
                      Colors.black.withValues(alpha: 0.20),
                      Colors.black.withValues(alpha: 0.55),
                    ],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(14),
                child: Align(
                  alignment: Alignment.bottomLeft,
                  child: FilledButton.icon(
                    onPressed: () => context.go('/zoriak'),
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFFF6D36B),
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      shape: const StadiumBorder(),
                      textStyle: const TextStyle(fontWeight: FontWeight.w900),
                    ),
                    icon: const Icon(Icons.menu_book_rounded),
                    label: const Text('Ver catálogo'),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _AvatarCircle extends StatelessWidget {
  const _AvatarCircle({required this.letter});

  final String letter;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 54,
      height: 54,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: const Color(0xFFF6D36B), width: 2),
      ),
      child: Center(
        child: Text(
          letter,
          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18),
        ),
      ),
    );
  }
}

class _ActionIcon extends StatelessWidget {
  const _ActionIcon({required this.icon, required this.onTap, this.filled = true});

  final IconData icon;
  final VoidCallback onTap;
  final bool filled;

  @override
  Widget build(BuildContext context) {
    final bg = filled ? const Color(0xFFF6D36B) : Colors.white;
    final border = Border.all(color: Colors.black.withValues(alpha: 0.08));
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        width: 42,
        height: 42,
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(14),
          border: border,
        ),
        child: Icon(icon, color: Colors.black87, size: 20),
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({required this.label, this.selected = false});

  final String label;
  final bool selected;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: selected ? const Color(0xFFF6D36B) : Colors.white,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: Colors.black.withValues(alpha: 0.08)),
      ),
      child: Text(
        label,
        style: TextStyle(fontWeight: FontWeight.w700, color: selected ? Colors.black : Colors.black87),
                ),
    );
  }
}
