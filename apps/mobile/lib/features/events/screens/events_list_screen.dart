import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/events_provider.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/svu_app_bar.dart';
import '../data/local_events.dart';

class EventsListScreen extends ConsumerStatefulWidget {
  const EventsListScreen({super.key});

  @override
  ConsumerState<EventsListScreen> createState() => _EventsListScreenState();
}

class _EventsListScreenState extends ConsumerState<EventsListScreen> {
  List<dynamic> _items = [];
  bool _loading = true;
  String? _error;
  String _query = '';
  bool _showLocal = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final data = await ref.read(eventsRepositoryProvider).list();
      setState(() {
        _items = data['items'] as List<dynamic>? ?? [];
        _showLocal = _items.isEmpty;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _showLocal = true;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final apiItems = _query.trim().isEmpty
        ? _items
        : _items.where((raw) {
            final e = raw is Map<String, dynamic> ? raw : <String, dynamic>{};
            final title = (e['title'] as String? ?? '').toLowerCase();
            final desc = (e['description'] as String? ?? '').toLowerCase();
            final q = _query.trim().toLowerCase();
            return title.contains(q) || desc.contains(q);
          }).toList();

    final localItems = _query.trim().isEmpty
        ? kLocalEvents
        : kLocalEvents.where((e) {
            final q = _query.trim().toLowerCase();
            return e.title.toLowerCase().contains(q) ||
                e.locationLabel.toLowerCase().contains(q) ||
                e.dateLabel.toLowerCase().contains(q);
          }).toList();

    return Scaffold(
      appBar: const SvuAppBar(title: 'Eventos'),
      body: _error != null
          ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [Text(_error!), const SizedBox(height: 16), FilledButton(onPressed: _load, child: const Text('Reintentar'))]))
          : _loading
              ? const Center(child: CircularProgressIndicator())
              : RefreshIndicator(
                  onRefresh: _load,
                  child: CustomScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    slivers: [
                      SliverToBoxAdapter(
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                          child: TextField(
                            onChanged: (v) => setState(() => _query = v),
                            decoration: const InputDecoration(
                              hintText: 'Buscar eventos…',
                              prefixIcon: Icon(Icons.search),
                            ),
                          ),
                        ),
                      ),
                      if ((_showLocal ? localItems : apiItems).isEmpty)
                        SliverFillRemaining(
                          hasScrollBody: false,
                          child: EmptyState(
                            title: 'No hay eventos',
                            message: 'Cuando tengamos eventos programados aparecerán aquí.',
                            icon: Icons.event_busy_outlined,
                            action: FilledButton(
                              onPressed: _load,
                              child: const Text('Recargar'),
                            ),
                          ),
                        )
                      else
                        SliverList.builder(
                          itemCount: _showLocal ? localItems.length : apiItems.length,
                          itemBuilder: (context, i) {
                            if (_showLocal) {
                              final e = localItems[i];
                              return _EventPosterCard(event: e);
                            }
                            final e = apiItems[i] as Map<String, dynamic>;
                            return Card(
                              margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(18),
                                side: BorderSide(color: Colors.black.withValues(alpha: 0.06)),
                              ),
                              child: ListTile(
                                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                leading: Container(
                                  width: 44,
                                  height: 44,
                                  decoration: BoxDecoration(
                                    color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.20),
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                  child: const Icon(Icons.event, color: Colors.black54),
                                ),
                                title: Text(e['title'] as String? ?? '', style: const TextStyle(fontWeight: FontWeight.w800)),
                                subtitle: Text(e['description'] as String? ?? e['startsAt']?.toString() ?? ''),
                                isThreeLine: true,
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

class _EventPosterCard extends StatelessWidget {
  const _EventPosterCard({required this.event});

  final LocalEvent event;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 14),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: BorderSide(color: Colors.black.withValues(alpha: 0.06)),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          AspectRatio(
            aspectRatio: 16 / 9,
            child: Stack(
              fit: StackFit.expand,
              children: [
                Image.asset(event.assetPath, fit: BoxFit.cover),
                DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.black.withValues(alpha: 0.00),
                        Colors.black.withValues(alpha: 0.40),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(event.title, style: const TextStyle(fontWeight: FontWeight.w900)),
                const SizedBox(height: 10),
                Row(
                  children: [
                    const Icon(Icons.calendar_month_rounded, size: 18),
                    const SizedBox(width: 6),
                    Expanded(child: Text(event.dateLabel)),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.location_on_outlined, size: 18),
                    const SizedBox(width: 6),
                    Expanded(child: Text(event.locationLabel)),
                  ],
                ),
                const SizedBox(height: 12),
                Align(
                  alignment: Alignment.centerLeft,
                  child: FilledButton(
                    onPressed: () => context.push('/events/${event.id}'),
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFFF6D36B),
                      foregroundColor: Colors.black,
                      shape: const StadiumBorder(),
                      textStyle: const TextStyle(fontWeight: FontWeight.w900),
                    ),
                    child: const Text('Ver detalles'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
