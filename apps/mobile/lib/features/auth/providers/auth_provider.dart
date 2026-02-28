import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../core/http/dio_client.dart';
import '../../../core/storage/token_storage.dart';

final tokenStorageProvider = Provider<TokenStorage>((_) => TokenStorage());

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(ref.read(dioClientProvider), ref.read(tokenStorageProvider));
});

class AuthRepository {
  AuthRepository(this._dio, this._storage);

  final Dio _dio;
  final TokenStorage _storage;

  Future<Map<String, dynamic>> register({required String email, required String password, required String fullName}) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>('/auth/register', data: {
        'email': email,
        'password': password,
        'fullName': fullName,
      });
      final data = res.data!;
      await _storage.saveTokens(
        accessToken: data['accessToken'] as String,
        refreshToken: data['refreshToken'] as String,
      );
      return data;
    } on DioException catch (e) {
      final code = e.response?.statusCode;
      if (code == 409) {
        throw Exception('Este correo ya está registrado. Intenta iniciar sesión.');
      }
      if (code == 400) {
        throw Exception('Revisa los datos (contraseña mínimo 8 caracteres).');
      }
      throw Exception('No se pudo registrar. Intenta de nuevo.');
    }
  }

  Future<Map<String, dynamic>> login({required String email, required String password}) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>('/auth/login', data: {
        'email': email,
        'password': password,
      });
      final data = res.data!;
      await _storage.saveTokens(
        accessToken: data['accessToken'] as String,
        refreshToken: data['refreshToken'] as String,
      );
      return data;
    } on DioException catch (e) {
      final code = e.response?.statusCode;
      if (code == 401) {
        throw Exception('Credenciales inválidas. Verifica tu correo y contraseña.');
      }
      throw Exception('No se pudo iniciar sesión. Intenta de nuevo.');
    }
  }

  Future<void> logout() => _storage.clear();

  Future<bool> isLoggedIn() => _storage.hasTokens();
}
