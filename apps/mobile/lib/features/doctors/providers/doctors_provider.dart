import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/http/dio_client.dart';

final doctorsRepositoryProvider = Provider<DoctorsRepository>((ref) {
  return DoctorsRepository(ref.read(dioClientProvider));
});

class DoctorsRepository {
  DoctorsRepository(this._dio);
  final dynamic _dio;

  Future<Map<String, dynamic>> list({int page = 1, int limit = 20, String? specialty, String? city}) async {
    final q = <String, dynamic>{'page': page, 'limit': limit};
    if (specialty != null && specialty.isNotEmpty) q['specialty'] = specialty;
    if (city != null && city.isNotEmpty) q['city'] = city;
    final res = await _dio.get<Map<String, dynamic>>('/doctors', queryParameters: q);
    return res.data!;
  }

  Future<Map<String, dynamic>> getById(String id) async {
    final res = await _dio.get<Map<String, dynamic>>('/doctors/$id');
    return res.data!;
  }
}
