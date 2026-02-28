import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/widgets/svu_app_bar.dart';
import '../providers/admin_providers.dart';

class DoctorApplicationsScreen extends ConsumerWidget {
  const DoctorApplicationsScreen({super.key});

  static const _statuses = <String?>['PENDING', 'APPROVED', 'REJECTED', null];

  String _label(String? s) {
    switch (s) {
      case 'PENDING':
        return 'Pendientes';
      case 'APPROVED':
        return 'Aprobadas';
      case 'REJECTED':
        return 'Rechazadas';
      default:
        return 'Todas';
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cs = Theme.of(context).colorScheme;
    final selected = ref.watch(adminDoctorApplicationsFilterProvider);
    final res = ref.watch(adminDoctorApplicationsProvider);

    return Scaffold(
      appBar: const SvuAppBar(title: 'Solicitudes', showBack: true),
      body: Column(
        children: [
          SizedBox(
            height: 54,
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 10),
              scrollDirection: Axis.horizontal,
              itemCount: _statuses.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, i) {
                final s = _statuses[i];
                final isSel = s == selected;
                return ChoiceChip(
                  selected: isSel,
                  onSelected: (_) {
                    ref.read(adminDoctorApplicationsFilterProvider.notifier).state = s;
                    ref.invalidate(adminDoctorApplicationsProvider);
                  },
                  label: Text(_label(s)),
                  selectedColor: const Color(0xFFF6D36B),
                  labelStyle: TextStyle(fontWeight: FontWeight.w900, color: isSel ? Colors.black : cs.onSurface.withValues(alpha: 0.8)),
                  shape: const StadiumBorder(),
                  side: BorderSide(color: cs.outlineVariant.withValues(alpha: 0.8)),
                );
              },
            ),
          ),
          Expanded(
            child: res.when(
              data: (data) {
                final items = (data['items'] as List<dynamic>? ?? const <dynamic>[])
                    .whereType<Map<String, dynamic>>()
                    .toList();
                if (items.isEmpty) {
                  return Center(
                    child: Text(
                      'No hay solicitudes.',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: cs.onSurface.withValues(alpha: 0.7)),
                    ),
                  );
                }
                return ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 6, 16, 16),
                  itemCount: items.length,
                  itemBuilder: (context, i) => _ApplicationTile(e: items[i]),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error: $e', style: TextStyle(color: cs.error))),
            ),
          ),
        ],
      ),
    );
  }
}

class _ApplicationTile extends StatelessWidget {
  const _ApplicationTile({required this.e});

  final Map<String, dynamic> e;

  @override
  Widget build(BuildContext context) {
    final id = (e['id'] ?? '').toString();
    final fullName = (e['fullName'] ?? '').toString();
    final email = (e['email'] ?? '').toString();
    final status = (e['status'] ?? '').toString();

    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: BorderSide(color: Colors.black.withValues(alpha: 0.06)),
      ),
      child: ListTile(
        onTap: id.isEmpty ? null : () => context.push('/admin/applications/$id'),
        title: Text(fullName.isEmpty ? 'Solicitud' : fullName, style: const TextStyle(fontWeight: FontWeight.w900)),
        subtitle: Text([if (email.isNotEmpty) email, if (status.isNotEmpty) status].join(' • ')),
        trailing: const Icon(Icons.chevron_right_rounded),
      ),
    );
  }
}

