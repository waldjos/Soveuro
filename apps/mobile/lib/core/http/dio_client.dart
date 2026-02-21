import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/env.dart';
import '../storage/token_storage.dart';
import 'auth_interceptor.dart';

final dioClientProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: Env.baseUrl,
    connectTimeout: const Duration(seconds: 15),
    receiveTimeout: const Duration(seconds: 15),
    headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
  ));
  dio.interceptors.add(AuthInterceptor(dio, TokenStorage()));
  return dio;
});
