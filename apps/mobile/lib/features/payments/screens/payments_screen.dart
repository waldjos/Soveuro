import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:in_app_purchase/in_app_purchase.dart';
import '../../profile/providers/profile_provider.dart';
import '../providers/payments_provider.dart';

class PaymentsScreen extends ConsumerWidget {
  const PaymentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final me = ref.watch(meProvider);
    final productsAsync = ref.watch(productsProvider);
    final message = ref.watch(paymentsMessageProvider);
    final controller = ref.read(paymentsControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Pagos')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(Icons.payment, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            Text('Suscripción', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            Text(
              'Gestiona tu suscripción con compras integradas (Apple / Google).',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Estado de suscripción', style: Theme.of(context).textTheme.titleSmall),
                    const SizedBox(height: 8),
                    me.when(
                      data: (data) {
                        final sub = data != null ? data['subscription'] as Map<String, dynamic>? : null;
                        if (sub == null) {
                          return const Text('Sin suscripción activa.');
                        }
                        final status = sub['status'] as String? ?? '-';
                        final isActive = status == 'ACTIVE';
                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Proveedor: ${sub['provider'] ?? '-'}'),
                            Text('Estado: $status', style: TextStyle(
                              fontWeight: FontWeight.w600,
                              color: isActive ? Colors.green : null,
                            )),
                            if (sub['planId'] != null) Text('Plan: ${sub['planId']}'),
                            if (sub['expiresAt'] != null) Text('Vence: ${sub['expiresAt']}'),
                          ],
                        );
                      },
                      loading: () => const Padding(
                        padding: EdgeInsets.all(8),
                        child: SizedBox(height: 24, width: 24, child: CircularProgressIndicator(strokeWidth: 2)),
                      ),
                      error: (_, __) => const Text('No se pudo cargar.'),
                    ),
                  ],
                ),
              ),
            ),
            if (message != null) ...[
              const SizedBox(height: 16),
              _MessageBanner(message: message),
            ],
            const SizedBox(height: 24),
            Text('Planes disponibles', style: Theme.of(context).textTheme.titleSmall),
            const SizedBox(height: 8),
            productsAsync.when(
              data: (products) {
                if (products.isEmpty) {
                  return const Card(
                    child: Padding(
                      padding: EdgeInsets.all(16),
                      child: Text('No hay productos configurados o la tienda no está disponible.'),
                    ),
                  );
                }
                return Column(
                  children: products.map((p) => _ProductTile(
                    product: p,
                    onSubscribe: () {
                      ref.read(paymentsMessageProvider.notifier).state = 'loading';
                      controller.purchase(p);
                    },
                  )).toList(),
                );
              },
              loading: () => const Padding(
                padding: EdgeInsets.all(16),
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (e, _) => Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text('Error al cargar productos: $e'),
                ),
              ),
            ),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: () async {
                ref.read(paymentsMessageProvider.notifier).state = 'loading';
                await controller.restorePurchases();
                ref.read(paymentsMessageProvider.notifier).state = 'success';
                ref.invalidate(meProvider);
              },
              icon: const Icon(Icons.restore),
              label: const Text('Restaurar compras'),
            ),
          ],
        ),
      ),
    );
  }
}

class _MessageBanner extends StatelessWidget {
  const _MessageBanner({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    final isError = message.startsWith('error:');
    final isSuccess = message == 'success';
    return Material(
      color: isError ? Colors.red.shade100 : (isSuccess ? Colors.green.shade100 : Colors.blue.shade100),
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Icon(
              isError ? Icons.error_outline : (isSuccess ? Icons.check_circle_outline : Icons.hourglass_empty),
              color: isError ? Colors.red : (isSuccess ? Colors.green : Colors.blue),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                isError ? message : (isSuccess ? 'Suscripción activada.' : 'Completa la compra en la ventana que se abrió.'),
                style: TextStyle(color: isError ? Colors.red.shade900 : (isSuccess ? Colors.green.shade900 : Colors.blue.shade900)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProductTile extends StatelessWidget {
  const _ProductTile({required this.product, required this.onSubscribe});

  final ProductDetails product;
  final VoidCallback onSubscribe;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product.title, style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 4),
                  Text(product.description, style: Theme.of(context).textTheme.bodySmall, maxLines: 2, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 4),
                  Text(product.price, style: Theme.of(context).textTheme.titleSmall),
                ],
              ),
            ),
            const SizedBox(width: 12),
            FilledButton(onPressed: onSubscribe, child: const Text('Suscribirme')),
          ],
        ),
      ),
    );
  }
}
