import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/profile_provider.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../shared/widgets/svu_app_bar.dart';
import '../../../shared/utils/external_links.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  Future<void> _refresh(WidgetRef ref) async {
    ref.invalidate(meProvider);
    try {
      await ref.read(meProvider.future);
    } catch (_) {}
  }

  static const _quickActions = <_QuickAction>[
    _QuickAction(
      icon: Icons.menu_book_rounded,
      label: 'Catálogo Zoriak',
      route: '/zoriak',
      emphasized: true,
    ),
    _QuickAction(
      icon: Icons.event_available_outlined,
      label: 'Costos congreso',
      url: 'https://soveuro.org/costos-congreso-y-precongreso-xxxv/',
    ),
    _QuickAction(
      icon: Icons.how_to_reg_outlined,
      label: 'Inscribirme',
      url: 'https://svu-member.vercel.app/',
    ),
    _QuickAction(
      icon: Icons.public,
      label: 'Sitio web',
      url: 'https://soveuro.org',
    ),
    _QuickAction(
      icon: Icons.history_edu_outlined,
      label: 'Historia',
      url: 'https://soveuro.org/historia/',
    ),
    _QuickAction(
      icon: Icons.menu_book_outlined,
      label: 'Revista',
      url: 'https://saber.ucv.ve/ojs/index.php/rev_rvuro',
    ),
    _QuickAction(
      icon: Icons.camera_alt_outlined,
      label: 'Instagram',
      url: 'https://www.instagram.com/sovzlauro?igsh=OGZvZWs0dThycDBx',
    ),
    _QuickAction(
      icon: Icons.chat_bubble_outline,
      label: 'WhatsApp',
      url: 'https://wa.link/crm327',
    ),
  ];

  Widget _buildProfileBody({
    required BuildContext context,
    required WidgetRef ref,
    Map<String, dynamic>? data,
    Object? error,
  }) {
    final user = data?['user'] as Map<String, dynamic>? ?? const <String, dynamic>{};
    final profile = data?['profile'] as Map<String, dynamic>? ?? const <String, dynamic>{};
    final subscription = data?['subscription'] as Map<String, dynamic>? ?? const <String, dynamic>{};

    final fullNameRaw = (profile['fullName'] ?? user['fullName'] ?? user['name'] ?? '').toString().trim();
    final fullName = fullNameRaw.isEmpty ? 'Usuario' : fullNameRaw;
    final email = (user['email'] ?? '').toString();
    final role = (user['role'] ?? '').toString();
    final isAdmin = role == 'ADMIN';
    final city = profile['city']?.toString();
    final initial = fullName.isNotEmpty ? fullName.substring(0, 1).toUpperCase() : '?';

    final status = (subscription['status'] ?? 'NONE').toString();
    final planId = subscription['planId']?.toString();
    final subLabel = status == 'ACTIVE' ? 'Suscripción activa' : 'Sin suscripción';

    return RefreshIndicator(
      onRefresh: () => _refresh(ref),
      child: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          if (error != null)
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              sliver: SliverToBoxAdapter(
                child: _ErrorBanner(
                  message: error.toString(),
                  onRetry: () => ref.invalidate(meProvider),
                ),
              ),
            )
          else
            const SliverToBoxAdapter(child: SizedBox(height: 4)),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
            sliver: SliverToBoxAdapter(
              child: _ProfileHeaderCard(
                initial: initial,
                fullName: fullName,
                email: email,
                city: city,
                subLabel: subLabel,
                planId: planId,
                status: status,
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            sliver: SliverToBoxAdapter(
              child: Wrap(
                spacing: 10,
                runSpacing: 10,
                children: [
                  const _StatPill(label: 'SVU', value: 'Miembro'),
                  _StatPill(label: 'Suscripción', value: status == 'ACTIVE' ? 'Activa' : '—'),
                  if (planId != null && planId.isNotEmpty) _StatPill(label: 'Plan', value: planId),
                ],
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 18, 16, 10),
            sliver: SliverToBoxAdapter(
              child: Text(
                'Acciones rápidas',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
              ),
            ),
          ),
          const SliverPadding(
            padding: EdgeInsets.fromLTRB(16, 0, 16, 12),
            sliver: SliverToBoxAdapter(
              child: _QuickActionsGrid(actions: _quickActions),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
            sliver: SliverToBoxAdapter(
              child: Text(
                'Patrocinador',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            sliver: SliverToBoxAdapter(
              child: _SponsorCard(
                onCatalog: () => context.push('/zoriak'),
              ),
            ),
          ),
                if (!isAdmin) ...[
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
                    sliver: SliverToBoxAdapter(
                      child: Text(
                        'Mi registro',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
                      ),
                    ),
                  ),
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                    sliver: SliverToBoxAdapter(
                      child: FilledButton.icon(
                        onPressed: () => context.push('/doctor-application'),
                        style: FilledButton.styleFrom(
                          backgroundColor: const Color(0xFFF6D36B),
                          foregroundColor: Colors.black,
                          minimumSize: const Size.fromHeight(48),
                          shape: const StadiumBorder(),
                          textStyle: const TextStyle(fontWeight: FontWeight.w900),
                        ),
                        icon: const Icon(Icons.badge_outlined),
                        label: const Text('Completar registro profesional'),
                      ),
                    ),
                  ),
                ],
                if (isAdmin) ...[
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
                    sliver: SliverToBoxAdapter(
                      child: Text(
                        'Administración',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
                      ),
                    ),
                  ),
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                    sliver: SliverToBoxAdapter(
                      child: FilledButton.icon(
                        onPressed: () => context.push('/admin'),
                        style: FilledButton.styleFrom(
                          backgroundColor: const Color(0xFF0B6B63),
                          foregroundColor: Colors.white,
                          minimumSize: const Size.fromHeight(48),
                          shape: const StadiumBorder(),
                          textStyle: const TextStyle(fontWeight: FontWeight.w900),
                        ),
                        icon: const Icon(Icons.admin_panel_settings_outlined),
                        label: const Text('Abrir panel'),
                      ),
                    ),
                  ),
                ],
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 6, 16, 24),
            sliver: SliverToBoxAdapter(
              child: FilledButton.icon(
                onPressed: () async {
                  await ref.read(authRepositoryProvider).logout();
                  if (context.mounted) context.go('/welcome');
                },
                style: FilledButton.styleFrom(
                  backgroundColor: const Color(0xFF0B6B63),
                  foregroundColor: Colors.white,
                  minimumSize: const Size.fromHeight(48),
                  shape: const StadiumBorder(),
                  textStyle: const TextStyle(fontWeight: FontWeight.w900),
                ),
                icon: const Icon(Icons.logout),
                label: const Text('Cerrar sesión'),
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final me = ref.watch(meProvider);
    return Scaffold(
      appBar: const SvuAppBar(title: 'Perfil'),
      body: me.when(
        data: (data) {
          return _buildProfileBody(context: context, ref: ref, data: data);
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => _buildProfileBody(context: context, ref: ref, error: e),
      ),
    );
  }
}

class _ProfileHeaderCard extends StatelessWidget {
  const _ProfileHeaderCard({
    required this.initial,
    required this.fullName,
    required this.email,
    required this.city,
    required this.subLabel,
    required this.planId,
    required this.status,
  });

  final String initial;
  final String fullName;
  final String email;
  final String? city;
  final String subLabel;
  final String? planId;
  final String status;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(22),
        side: BorderSide(color: Colors.black.withValues(alpha: 0.06)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(999),
                border: Border.all(color: const Color(0xFFF6D36B), width: 2),
              ),
              child: Center(
                child: Text(
                  initial,
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w900),
                ),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    fullName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900),
                  ),
                  const SizedBox(height: 2),
                  if (email.isNotEmpty)
                    Text(
                      email,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.black.withValues(alpha: 0.65)),
                    ),
                  if (city != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      city!,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.black.withValues(alpha: 0.55)),
                    ),
                  ],
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Icon(Icons.verified_rounded, size: 16, color: status == 'ACTIVE' ? Colors.green : Colors.black38),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          planId == null || planId!.isEmpty ? subLabel : '$subLabel · $planId',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontWeight: FontWeight.w800),
                        ),
                      ),
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

class _StatPill extends StatelessWidget {
  const _StatPill({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFF6D36B),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(value, style: const TextStyle(fontWeight: FontWeight.w900)),
          Text(label, style: const TextStyle(fontSize: 12)),
        ],
      ),
    );
  }
}

class _QuickAction {
  const _QuickAction({
    required this.icon,
    required this.label,
    this.url,
    this.route,
    this.emphasized = false,
  });

  final IconData icon;
  final String label;
  final String? url;
  final String? route;
  final bool emphasized;
}

class _QuickActionsGrid extends StatelessWidget {
  const _QuickActionsGrid({required this.actions});

  final List<_QuickAction> actions;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, c) {
        const gap = 12.0;
        final width = c.maxWidth;
        final itemW = (width - gap) / 2;
        return Wrap(
          spacing: gap,
          runSpacing: gap,
          children: actions.map((a) {
            return SizedBox(
              width: itemW,
              child: _QuickActionCard(action: a),
            );
          }).toList(),
        );
      },
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  const _QuickActionCard({required this.action});

  final _QuickAction action;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () async {
        if (action.route != null && action.route!.isNotEmpty) {
          context.push(action.route!);
          return;
        }
        if (action.url != null && action.url!.isNotEmpty) {
          final ok = await openExternalUrl(action.url!);
          if (!ok && context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('No se pudo abrir el vínculo.')),
            );
          }
        }
      },
      borderRadius: BorderRadius.circular(18),
      child: Card(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: BorderSide(color: Colors.black.withValues(alpha: 0.06)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: action.emphasized ? const Color(0xFF0B6B63) : Theme.of(context).colorScheme.primary.withValues(alpha: 0.22),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(action.icon, color: action.emphasized ? Colors.white : Colors.black54),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  action.label,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(fontWeight: FontWeight.w900, color: action.emphasized ? const Color(0xFF0B6B63) : null),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SponsorCard extends StatelessWidget {
  const _SponsorCard({required this.onCatalog});

  final VoidCallback onCatalog;

  @override
  Widget build(BuildContext context) {
    return Card(
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
            Center(
              child: Image.asset(
                'assets/sponsors/zoriak.png',
                height: 42,
                fit: BoxFit.contain,
                filterQuality: FilterQuality.high,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              'Zoriak Pharma',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 6),
            Text(
              'Catálogo: Salud Sexual y Urología',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.black.withValues(alpha: 0.70)),
            ),
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: onCatalog,
              style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFFF6D36B),
                foregroundColor: Colors.black,
                minimumSize: const Size.fromHeight(48),
                shape: const StadiumBorder(),
                textStyle: const TextStyle(fontWeight: FontWeight.w900),
              ),
              icon: const Icon(Icons.menu_book_rounded),
              label: const Text('Catálogo Zoriak'),
            ),
          ],
        ),
      ),
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.orange.withValues(alpha: 0.15),
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            const Icon(Icons.warning_amber_rounded, color: Colors.orange),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'No se pudo cargar tu perfil (500). Puedes usar la app igual y reintentar.',
                style: TextStyle(color: Colors.black.withValues(alpha: 0.75), fontWeight: FontWeight.w700),
              ),
            ),
            const SizedBox(width: 10),
            FilledButton(
              onPressed: onRetry,
              style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFFF6D36B),
                foregroundColor: Colors.black,
                shape: const StadiumBorder(),
              ),
              child: const Text('Reintentar'),
            ),
          ],
        ),
      ),
    );
  }
}
