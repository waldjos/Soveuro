import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../profile/providers/profile_provider.dart';

class PaymentsScreen extends ConsumerWidget {
  const PaymentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final me = ref.watch(meProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Pagos')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(Icons.payment, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            Text('Seccion de pagos', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            Text('Aqui se integrara IAP (Apple/Google) y opcionalmente Stripe.', style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: 24),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Estado de suscripcion', style: Theme.of(context).textTheme.titleSmall),
                    const SizedBox(height: 8),
                    me.when(
                      data: (data) {
                        final sub = data != null ? data['subscription'] as Map<String, dynamic>? : null;
                        if (sub == null) return const Text('Sin suscripcion activa.');
                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Proveedor: ${sub['provider'] ?? '-'}'),
                            Text('Estado: ${sub['status'] ?? '-'}'),
                            if (sub['expiresAt'] != null) Text('Vence: ${sub['expiresAt']}'),
                          ],
                        );
                      },
                      loading: () => const CircularProgressIndicator(),
                      error: (_, __) => const Text('No se pudo cargar.'),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
