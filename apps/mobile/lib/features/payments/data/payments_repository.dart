import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/http/dio_client.dart';

class PaymentsRepository {
  PaymentsRepository(this._dio);
  final Dio _dio;

  /// Envía compra al backend para verificación. provider: APPLE | GOOGLE.
  Future<Map<String, dynamic>> verify({
    required String provider,
    required String planId,
    required String productId,
    String? receipt,
    String? purchaseToken,
  }) async {
    final body = <String, dynamic>{
      'provider': provider,
      'planId': planId,
      'productId': productId,
    };
    if (receipt != null) body['receipt'] = receipt;
    if (purchaseToken != null) body['purchaseToken'] = purchaseToken;

    final res = await _dio.post<Map<String, dynamic>>('/payments/verify', data: body);
    return res.data!;
  }
}

final paymentsRepositoryProvider = Provider<PaymentsRepository>((ref) {
  return PaymentsRepository(ref.read(dioClientProvider));
});
