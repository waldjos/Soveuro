import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'core/storage/token_storage.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/auth/screens/register_screen.dart';
import 'features/doctors/screens/doctors_list_screen.dart';
import 'features/doctors/screens/doctor_detail_screen.dart';
import 'features/events/screens/events_list_screen.dart';
import 'features/payments/screens/payments_screen.dart';
import 'features/profile/screens/profile_screen.dart';
import 'shared/widgets/main_scaffold.dart';

final _tokenStorage = TokenStorage();

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/doctors',
    redirect: (context, state) async {
      final hasToken = await _tokenStorage.hasTokens();
      final isAuthRoute = state.matchedLocation == '/login' || state.matchedLocation == '/register';
      if (!hasToken && !isAuthRoute) return '/login';
      if (hasToken && isAuthRoute) return '/doctors';
      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
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
          GoRoute(path: '/events', builder: (_, __) => const EventsListScreen()),
          GoRoute(path: '/payments', builder: (_, __) => const PaymentsScreen()),
          GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
        ],
      ),
    ],
  );
});
