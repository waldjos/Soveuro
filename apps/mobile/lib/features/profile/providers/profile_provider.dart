import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/http/dio_client.dart';

final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  return ProfileRepository(ref.read(dioClientProvider));
});

class ProfileRepository {
  ProfileRepository(this._dio);
  final dynamic _dio;

  Future<Map<String, dynamic>> me() async {
    final res = await _dio.get<Map<String, dynamic>>('/me');
    return res.data!;
  }
}

final meProvider = FutureProvider<Map<String, dynamic>?>((ref) async {
  try {
    return await ref.read(profileRepositoryProvider).me();
  } catch (_) {
    return null;
  }
});
