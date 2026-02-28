import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/widgets/svu_app_bar.dart';
import '../data/admin_repository.dart';
import '../providers/admin_providers.dart';

class DoctorApplicationDetailScreen extends ConsumerWidget {
  const DoctorApplicationDetailScreen({super.key, required this.applicationId});

  final String applicationId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cs = Theme.of(context).colorScheme;
    final app = ref.watch(adminDoctorApplicationProvider(applicationId));

    return Scaffold(
      appBar: const SvuAppBar(title: 'Solicitud', showBack: true),
      body: app.when(
        data: (data) {
          final status = (data['status'] ?? '').toString();
          final fullName = (data['fullName'] ?? '').toString();
          final email = (data['email'] ?? '').toString();
          final phone = (data['phone'] ?? '').toString();
          final nationalId = (data['nationalId'] ?? '').toString();
          final location = (data['location'] ?? '').toString();
          final doctorType = (data['doctorType'] ?? '').toString();
          final subspecialty = (data['subspecialty'] ?? '').toString();
          final avatarUrl = (data['avatarUrl'] ?? '').toString();

          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
            children: [
              if (avatarUrl.isNotEmpty)
                Center(
                  child: CircleAvatar(
                    radius: 42,
                    backgroundImage: NetworkImage(avatarUrl),
                  ),
                )
              else
                const Center(child: CircleAvatar(radius: 42, child: Icon(Icons.person))),
              const SizedBox(height: 12),
              Center(
                child: Text(
                  fullName.isEmpty ? '—' : fullName,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900),
                ),
              ),
              const SizedBox(height: 6),
              Center(child: Text([email, status].where((s) => s.isNotEmpty).join(' • '))),
              const SizedBox(height: 16),
              _InfoCard(
                items: {
                  'Teléfono': phone,
                  'Cédula': nationalId,
                  'Ubicación': location,
                  'Estatus': doctorType,
                  'Subespecialidad': subspecialty,
                },
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: status == 'APPROVED'
                          ? null
                          : () async {
                              await ref.read(adminRepositoryProvider).approveDoctorApplication(applicationId);
                              ref.invalidate(adminDoctorApplicationProvider(applicationId));
                              ref.invalidate(adminDoctorApplicationsProvider);
                              ref.invalidate(adminAuditProvider);
                              if (context.mounted) context.pop();
                            },
                      style: FilledButton.styleFrom(
                        backgroundColor: const Color(0xFF0B6B63),
                        foregroundColor: Colors.white,
                        minimumSize: const Size.fromHeight(48),
                        shape: const StadiumBorder(),
                        textStyle: const TextStyle(fontWeight: FontWeight.w900),
                      ),
                      icon: const Icon(Icons.verified),
                      label: const Text('Aprobar'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: status == 'REJECTED'
                          ? null
                          : () async {
                              await ref.read(adminRepositoryProvider).rejectDoctorApplication(applicationId);
                              ref.invalidate(adminDoctorApplicationProvider(applicationId));
                              ref.invalidate(adminDoctorApplicationsProvider);
                              ref.invalidate(adminAuditProvider);
                              if (context.mounted) context.pop();
                            },
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size.fromHeight(48),
                        shape: const StadiumBorder(),
                        foregroundColor: cs.onSurface,
                        side: BorderSide(color: cs.outlineVariant),
                        backgroundColor: Colors.white,
                        textStyle: const TextStyle(fontWeight: FontWeight.w900),
                      ),
                      icon: const Icon(Icons.block),
                      label: const Text('Rechazar'),
                    ),
                  ),
                ],
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e', style: TextStyle(color: cs.error))),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({required this.items});

  final Map<String, String> items;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final filtered = items.entries.where((e) => e.value.trim().isNotEmpty).toList();
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: BorderSide(color: Colors.black.withValues(alpha: 0.06)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: filtered.isEmpty
            ? Text('Sin datos.', style: TextStyle(color: cs.onSurface.withValues(alpha: 0.7)))
            : Column(
                children: filtered
                    .map(
                      (e) => Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            SizedBox(
                              width: 110,
                              child: Text(
                                e.key,
                                style: const TextStyle(fontWeight: FontWeight.w900),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(child: Text(e.value)),
                          ],
                        ),
                      ),
                    )
                    .toList(),
              ),
      ),
    );
  }
}

