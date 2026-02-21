import 'package:dio/dio.dart';
import '../config/env.dart';
import '../storage/token_storage.dart';

class AuthInterceptor extends Interceptor {
  AuthInterceptor(this._dio, this._tokenStorage);

  final Dio _dio;
  final TokenStorage _tokenStorage;

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await _tokenStorage.getAccessToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      final refreshToken = await _tokenStorage.getRefreshToken();
      if (refreshToken == null || refreshToken.isEmpty) {
        return handler.next(err);
      }
      try {
        final dio = Dio(BaseOptions(baseUrl: Env.baseUrl));
        final response = await dio.post<Map<String, dynamic>>(
          '/auth/refresh',
          data: {'refreshToken': refreshToken},
          options: Options(headers: {'Content-Type': 'application/json'}),
        );
        final data = response.data;
        if (data != null && data['accessToken'] != null && data['refreshToken'] != null) {
          await _tokenStorage.saveTokens(
            accessToken: data['accessToken'] as String,
            refreshToken: data['refreshToken'] as String,
          );
          final opts = err.requestOptions;
          opts.headers['Authorization'] = 'Bearer ${data['accessToken']}';
          final retry = await _dio.fetch(opts);
          return handler.resolve(retry);
        }
      } catch (_) {}
    }
    handler.next(err);
  }
}
