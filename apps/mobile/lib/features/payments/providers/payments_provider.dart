import 'dart:async';
import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:in_app_purchase/in_app_purchase.dart';
import '../../profile/providers/profile_provider.dart';
import '../config/payment_products.dart';
import '../data/payments_repository.dart';

/// Controlador de pagos IAP: cargar productos, comprar, restaurar y verificar en backend.
class PaymentsController {
  PaymentsController({required Ref ref, required PaymentsRepository repository})
      : _ref = ref,
        _repository = repository;

  final Ref _ref;
  final PaymentsRepository _repository;
  StreamSubscription<List<PurchaseDetails>>? _subscription;
  bool _initialized = false;

  Future<void> _ensureInitialized() async {
    if (_initialized) return;
    _initialized = await InAppPurchase.instance.isAvailable();
    if (!_initialized) return;
    _subscription = InAppPurchase.instance.purchaseStream.listen(
      _onPurchaseUpdates,
      onDone: () {},
      onError: (_) {},
    );
  }

  void _onPurchaseUpdates(List<PurchaseDetails> purchases) async {
    for (final detail in purchases) {
      if (detail.status != PurchaseStatus.purchased &&
          detail.status != PurchaseStatus.restored) {
        continue;
      }
      final verificationData = detail.verificationData;
      final serverData = verificationData.serverVerificationData;
      final source = verificationData.source;
      final provider = _providerFromSource(source);
      if (provider == null) continue;
      final planId = planIdFromProductId(detail.productID);
      try {
        if (provider == 'APPLE') {
          await _repository.verify(
            provider: provider,
            planId: planId,
            productId: detail.productID,
            receipt: serverData,
          );
        } else {
          await _repository.verify(
            provider: provider,
            planId: planId,
            productId: detail.productID,
            purchaseToken: serverData,
          );
        }
        _ref.invalidate(meProvider);
        _ref.read(paymentsMessageProvider.notifier).state = 'success';
      } catch (e) {
        _ref.read(paymentsMessageProvider.notifier).state = 'error: $e';
      }
    }
  }

  String? _providerFromSource(String source) {
    if (source.contains('AppStore') || source.toLowerCase().contains('apple')) return 'APPLE';
    if (source.contains('GooglePlay') || source.contains('Play')) return 'GOOGLE';
    if (Platform.isIOS) return 'APPLE';
    if (Platform.isAndroid) return 'GOOGLE';
    return null;
  }

  /// Carga productos de suscripción.
  Future<List<ProductDetails>> loadProducts() async {
    await _ensureInitialized();
    if (!_initialized) return [];
    final response = await InAppPurchase.instance.getProducts(kSubscriptionProductIds);
    if (response.notFoundIDs.isNotEmpty) return response.productDetails;
    return response.productDetails;
  }

  /// Inicia la compra IAP del producto.
  Future<void> purchase(ProductDetails product) async {
    await _ensureInitialized();
    if (!_initialized) return;
    final param = PurchaseParam(productDetails: product);
    await InAppPurchase.instance.buyNonConsumable(purchaseParam: param);
  }

  /// Restaura compras; el stream enviará los detalles y se verificarán en backend.
  Future<void> restorePurchases() async {
    await _ensureInitialized();
    if (!_initialized) return;
    await InAppPurchase.instance.restorePurchases();
  }

  void dispose() {
    _subscription?.cancel();
  }
}

/// Mensaje de estado para la UI: null | 'loading' | 'success' | 'error: ...'
final paymentsMessageProvider = StateProvider<String?>((ref) => null);

final paymentsControllerProvider = Provider<PaymentsController>((ref) {
  final controller = PaymentsController(
    ref: ref,
    repository: ref.read(paymentsRepositoryProvider),
  );
  ref.onDispose(() => controller.dispose());
  return controller;
});

/// Productos disponibles (cache del controller).
final productsProvider = FutureProvider<List<ProductDetails>>((ref) async {
  return ref.read(paymentsControllerProvider).loadProducts();
});
