import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/http/dio_client.dart';

final doctorApplicationRepositoryProvider = Provider<DoctorApplicationRepository>((ref) {
  return DoctorApplicationRepository(ref.read(dioClientProvider));
});

class DoctorApplicationRepository {
  DoctorApplicationRepository(this._dio);
  final Dio _dio;

  Future<String> uploadAvatar(File file) async {
    final form = FormData.fromMap({
      'file': await MultipartFile.fromFile(file.path),
    });
    final res = await _dio.post<Map<String, dynamic>>(
      '/uploads/avatar',
      data: form,
      options: Options(contentType: 'multipart/form-data'),
    );
    final data = res.data ?? const <String, dynamic>{};
    return (data['url'] ?? data['path'] ?? '').toString();
  }

  Future<Map<String, dynamic>> upsertApplication({
    required String phone,
    required String nationalId,
    required String location,
    required String doctorType,
    required String specialty,
    required String subspecialty,
    String? avatarUrl,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      '/doctor-applications',
      data: {
        'phone': phone,
        'nationalId': nationalId,
        'location': location,
        'doctorType': doctorType,
        'specialty': specialty,
        'subspecialty': subspecialty,
        if (avatarUrl != null && avatarUrl.isNotEmpty) 'avatarUrl': avatarUrl,
      },
    );
    return res.data ?? <String, dynamic>{};
  }
}

