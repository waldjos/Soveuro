import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/widgets/svu_app_bar.dart';
import '../providers/admin_providers.dart';

class AdminHomeScreen extends ConsumerWidget {
  const AdminHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final audit = ref.watch(adminAuditProvider);
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: const SvuAppBar(title: 'Administración', showBack: true),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
        children: [
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(18),
              side: BorderSide(color: Colors.black.withValues(alpha: 0.06)),
            ),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Solicitudes de doctor',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Aprueba o rechaza registros y revisa la información de cada usuario.',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: cs.onSurface.withValues(alpha: 0.70)),
                  ),
                  const SizedBox(height: 12),
                  FilledButton.icon(
                    onPressed: () => context.push('/admin/applications'),
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFFF6D36B),
                      foregroundColor: Colors.black,
                      minimumSize: const Size.fromHeight(48),
                      shape: const StadiumBorder(),
                      textStyle: const TextStyle(fontWeight: FontWeight.w900),
                    ),
                    icon: const Icon(Icons.assignment_turned_in_outlined),
                    label: const Text('Ver solicitudes'),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14),
          Text(
            'Actividad (en vivo)',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 10),
          audit.when(
            data: (items) {
              if (items.isEmpty) {
                return Text(
                  'Sin actividad reciente.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: cs.onSurface.withValues(alpha: 0.70)),
                );
              }
              return Column(
                children: items.take(20).map((e) => _AuditTile(e: e)).toList(),
              );
            },
            loading: () => const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator())),
            error: (e, _) => Text('Error: $e', style: TextStyle(color: cs.error)),
          ),
        ],
      ),
    );
  }
}

class _AuditTile extends StatelessWidget {
  const _AuditTile({required this.e});

  final Map<String, dynamic> e;

  @override
  Widget build(BuildContext context) {
    final type = (e['type'] ?? '').toString();
    final email = (e['userEmail'] ?? '').toString();
    final at = (e['createdAt'] ?? '').toString();
    final cs = Theme.of(context).colorScheme;

    IconData icon;
    switch (type) {
      case 'LOGIN_SUCCESS':
        icon = Icons.login;
        break;
      case 'REGISTER_SUCCESS':
        icon = Icons.person_add_alt_1;
        break;
      case 'DOCTOR_APP_SUBMITTED':
        icon = Icons.assignment_outlined;
        break;
      case 'DOCTOR_APP_APPROVED':
        icon = Icons.verified;
        break;
      case 'DOCTOR_APP_REJECTED':
        icon = Icons.block;
        break;
      default:
        icon = Icons.bolt;
    }

    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: BorderSide(color: Colors.black.withValues(alpha: 0.06)),
      ),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: const Color(0xFFF6D36B),
          foregroundColor: Colors.black,
          child: Icon(icon),
        ),
        title: Text(
          type.replaceAll('_', ' '),
          style: const TextStyle(fontWeight: FontWeight.w900),
        ),
        subtitle: Text(
          [if (email.isNotEmpty) email, if (at.isNotEmpty) at].join(' • '),
          style: TextStyle(color: cs.onSurface.withValues(alpha: 0.70)),
        ),
      ),
    );
  }
}

