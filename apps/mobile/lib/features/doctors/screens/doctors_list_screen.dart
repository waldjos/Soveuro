import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/doctors_provider.dart';

class DoctorsListScreen extends ConsumerStatefulWidget {
  const DoctorsListScreen({super.key});

  @override
  ConsumerState<DoctorsListScreen> createState() => _DoctorsListScreenState();
}

class _DoctorsListScreenState extends ConsumerState<DoctorsListScreen> {
  List<dynamic> _items = [];
  int _total = 0;
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
        _total = data['total'] as int? ?? 0;
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
    return Scaffold(
      appBar: AppBar(title: const Text('Doctores')),
      body: _error != null
          ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [Text(_error!), const SizedBox(height: 16), FilledButton(onPressed: _load, child: const Text('Reintentar'))]))
          : _loading && _items.isEmpty
              ? const Center(child: CircularProgressIndicator())
              : RefreshIndicator(
                  onRefresh: () async {
                    _page = 1;
                    await _load();
                  },
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _items.length + (_loading ? 1 : 0),
                    itemBuilder: (context, i) {
                      if (i == _items.length) return const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator()));
                      final d = _items[i] as Map<String, dynamic>;
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                            child: Text((d['fullName'] as String? ?? '?').isNotEmpty ? (d['fullName'] as String).substring(0, 1).toUpperCase() : '?'),
                          ),
                          title: Text(d['fullName'] as String? ?? ''),
                          subtitle: Text('${d['specialty'] ?? ''}${d['city'] != null ? ' · ${d['city']}' : ''}'),
                          trailing: d['verified'] == true ? const Icon(Icons.verified, color: Colors.blue) : null,
                          onTap: () => context.push('/doctors/${d['id']}'),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
