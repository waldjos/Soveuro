class Env {
  Env._();

  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://soveuro.onrender.com',
  );
}
