import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/http/dio_client.dart';

final adminRepositoryProvider = Provider<AdminRepository>((ref) {
  return AdminRepository(ref.read(dioClientProvider));
});

class AdminRepository {
  AdminRepository(this._dio);

  final Dio _dio;

  Future<List<Map<String, dynamic>>> listAudit({int limit = 20}) async {
    final res = await _dio.get<List<dynamic>>('/admin/audit', queryParameters: {'limit': limit});
    final data = res.data ?? const <dynamic>[];
    return data.whereType<Map<String, dynamic>>().toList();
  }

  Future<Map<String, dynamic>> listDoctorApplications({
    String? status,
    int page = 1,
    int limit = 20,
  }) async {
    final res = await _dio.get<Map<String, dynamic>>(
      '/admin/doctor-applications',
      queryParameters: {
        'status': status,
        'page': page,
        'limit': limit,
      }..removeWhere((k, v) => v == null || (v is String && v.isEmpty)),
    );
    return res.data ?? <String, dynamic>{};
  }

  Future<Map<String, dynamic>> getDoctorApplication(String id) async {
    final res = await _dio.get<Map<String, dynamic>>('/admin/doctor-applications/$id');
    return res.data ?? <String, dynamic>{};
  }

  Future<void> approveDoctorApplication(String id) async {
    await _dio.patch<void>('/admin/doctor-applications/$id/approve');
  }

  Future<void> rejectDoctorApplication(String id, {String? reason}) async {
    await _dio.patch<void>('/admin/doctor-applications/$id/reject', data: {'reason': reason});
  }
}

