import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../profile/providers/profile_provider.dart';
import '../../../shared/widgets/svu_app_bar.dart';

class PaymentsScreen extends ConsumerWidget {
  const PaymentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final me = ref.watch(meProvider);
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: const SvuAppBar(title: 'Pagos'),
      body: me.when(
        data: (data) {
          final summary = (data?['feesSummary'] as Map<String, dynamic>?) ?? const <String, dynamic>{};
          final currency = (summary['currency'] ?? 'USD').toString();
          final coleg = (summary['colegiatura'] as Map<String, dynamic>?) ?? const <String, dynamic>{};
          final cong = (summary['congresos'] as Map<String, dynamic>?) ?? const <String, dynamic>{};
          final colegPaid = (coleg['paidCents'] ?? 0) as int;
          final colegPending = (coleg['pendingCents'] ?? 0) as int;
          final congPaid = (cong['paidCents'] ?? 0) as int;
          final congPending = (cong['pendingCents'] ?? 0) as int;

          String money(int cents) => '${(cents / 100).toStringAsFixed(2)} $currency';

          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
            children: [
              Text('Colegiatura', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900)),
              const SizedBox(height: 10),
              _SummaryCard(
                colegPaid: money(colegPaid),
                colegPending: money(colegPending),
                congPaid: money(congPaid),
                congPending: money(congPending),
              ),
              const SizedBox(height: 14),
              Text(
                'Nota',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 8),
              _SoftCard(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Text(
                    'El monto de tu colegiatura y el pago de tus inscripciones a congresos se verán reflejadas en este renglón.',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: cs.onSurface.withValues(alpha: 0.75)),
                  ),
                ),
              ),
              const SizedBox(height: 18),
              Text(
                'Métodos de pago',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 10),
              const _MethodTile(
                icon: Icons.account_balance_wallet_outlined,
                title: 'PayPal',
                subtitle: 'Paga con PayPal (enlace/indicaciones).',
              ),
              const _MethodTile(
                icon: Icons.payments_outlined,
                title: 'Zelle',
                subtitle: 'Transferencia Zelle (indicaciones).',
              ),
              const _MethodTile(
                icon: Icons.phone_android_outlined,
                title: 'Pago móvil',
                subtitle: 'Pago móvil bancario (indicaciones).',
              ),
              const _MethodTile(
                icon: Icons.account_balance_outlined,
                title: 'Transferencia bancaria nacional',
                subtitle: 'Transferencia nacional (indicaciones).',
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

class _SoftCard extends StatelessWidget {
  const _SoftCard({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: BorderSide(color: Colors.black.withValues(alpha: 0.06)),
      ),
      child: child,
    );
  }
}

class _SummaryCard extends StatelessWidget {
  const _SummaryCard({
    required this.colegPaid,
    required this.colegPending,
    required this.congPaid,
    required this.congPending,
  });

  final String colegPaid;
  final String colegPending;
  final String congPaid;
  final String congPending;

  @override
  Widget build(BuildContext context) {
    return _SoftCard(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Resumen', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900)),
            const SizedBox(height: 10),
            _Line(label: 'Colegiatura pagada', value: colegPaid),
            _Line(label: 'Colegiatura pendiente', value: colegPending),
            const SizedBox(height: 6),
            _Line(label: 'Congresos pagados', value: congPaid),
            _Line(label: 'Congresos pendientes', value: congPending),
          ],
        ),
      ),
    );
  }
}

class _Line extends StatelessWidget {
  const _Line({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Expanded(child: Text(label, style: const TextStyle(fontWeight: FontWeight.w800))),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w900)),
        ],
      ),
    );
  }
}

class _MethodTile extends StatelessWidget {
  const _MethodTile({required this.icon, required this.title, required this.subtitle});

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: BorderSide(color: Colors.black.withValues(alpha: 0.06)),
      ),
      child: ListTile(
        leading: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.22),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Icon(icon, color: Colors.black54),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w900)),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right_rounded),
        onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Indicaciones de pago por configurar.')),
          );
        },
      ),
    );
  }
}
