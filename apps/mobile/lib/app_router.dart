import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'core/storage/token_storage.dart';
import 'features/auth/screens/welcome_screen.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/auth/screens/register_screen.dart';
import 'features/doctors/screens/doctors_list_screen.dart';
import 'features/doctors/screens/doctor_detail_screen.dart';
import 'features/events/screens/events_list_screen.dart';
import 'features/events/screens/event_detail_screen.dart';
import 'features/payments/screens/payments_screen.dart';
import 'features/profile/screens/profile_screen.dart';
import 'features/admin/screens/admin_home_screen.dart';
import 'features/admin/screens/doctor_applications_screen.dart';
import 'features/admin/screens/doctor_application_detail_screen.dart';
import 'features/doctor_application/screens/doctor_application_form_screen.dart';
import 'features/sponsors/zoriak_catalog/screens/zoriak_catalog_screen.dart';
import 'features/sponsors/zoriak_catalog/screens/zoriak_product_detail_screen.dart';
import 'shared/widgets/main_scaffold.dart';

final _tokenStorage = TokenStorage();

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/welcome',
    redirect: (context, state) async {
      final hasToken = await _tokenStorage.hasTokens();
      final loc = state.matchedLocation;
      final isAuthRoute = loc == '/welcome' || loc == '/login' || loc == '/register';
      if (!hasToken && !isAuthRoute) return '/welcome';
      if (hasToken && isAuthRoute) return '/doctors';
      return null;
    },
    routes: [
      GoRoute(path: '/welcome', builder: (_, __) => const WelcomeScreen()),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
      GoRoute(path: '/doctor-application', builder: (_, __) => const DoctorApplicationFormScreen()),
      ShellRoute(
        builder: (context, state, child) => MainScaffold(child: child),
        routes: [
          GoRoute(
            path: '/doctors',
            builder: (_, __) => const DoctorsListScreen(),
            routes: [
              GoRoute(path: ':id', builder: (_, state) => DoctorDetailScreen(doctorId: state.pathParameters['id']!)),
            ],
          ),
          GoRoute(
            path: '/events',
            builder: (_, __) => const EventsListScreen(),
            routes: [
              GoRoute(
                path: ':id',
                builder: (_, state) => EventDetailScreen(eventId: state.pathParameters['id']!),
              ),
            ],
          ),
          GoRoute(path: '/payments', builder: (_, __) => const PaymentsScreen()),
          GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
          GoRoute(
            path: '/zoriak',
            builder: (_, __) => const ZoriakCatalogScreen(),
            routes: [
              GoRoute(
                path: ':id',
                builder: (_, state) => ZoriakProductDetailScreen(productId: state.pathParameters['id']!),
              ),
            ],
          ),
          GoRoute(
            path: '/admin',
            builder: (_, __) => const AdminHomeScreen(),
            routes: [
              GoRoute(
                path: 'applications',
                builder: (_, __) => const DoctorApplicationsScreen(),
                routes: [
                  GoRoute(
                    path: ':id',
                    builder: (_, state) => DoctorApplicationDetailScreen(applicationId: state.pathParameters['id']!),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  );
});
