import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/profile_provider.dart';
import '../../auth/providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final me = ref.watch(meProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Perfil')),
      body: me.when(
        data: (data) {
          if (data == null) return const Center(child: Text('No se pudo cargar el perfil.'));
          final user = data['user'] as Map<String, dynamic>? ?? {};
          final profile = data['profile'] as Map<String, dynamic>? ?? {};
          return SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                CircleAvatar(
                  radius: 48,
                  backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                  child: Text(
                    (profile['fullName'] as String? ?? '?').isNotEmpty ? (profile['fullName'] as String).substring(0, 1).toUpperCase() : '?',
                    style: Theme.of(context).textTheme.headlineLarge,
                  ),
                ),
                const SizedBox(height: 16),
                Text(profile['fullName'] as String? ?? '', style: Theme.of(context).textTheme.titleLarge),
                Text(user['email'] as String? ?? '', style: Theme.of(context).textTheme.bodyMedium),
                if (profile['city'] != null) Text(profile['city'] as String, style: Theme.of(context).textTheme.bodySmall),
                const SizedBox(height: 32),
                FilledButton.icon(
                  onPressed: () async {
                    await ref.read(authRepositoryProvider).logout();
                    if (context.mounted) context.go('/login');
                  },
                  icon: const Icon(Icons.logout),
                  label: const Text('Cerrar sesión'),
                ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }
}
