import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class MainScaffold extends StatelessWidget {
  const MainScaffold({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex(context),
        onDestinationSelected: (i) {
          switch (i) {
            case 0:
              context.go('/doctors');
              break;
            case 1:
              context.go('/events');
              break;
            case 2:
              context.go('/zoriak');
              break;
            case 3:
              context.go('/payments');
              break;
            case 4:
              context.go('/profile');
              break;
          }
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.medical_services), label: 'Doctores'),
          NavigationDestination(icon: Icon(Icons.event), label: 'Eventos'),
          NavigationDestination(
            icon: Padding(
              padding: EdgeInsets.only(top: 2),
              child: Image(
                image: AssetImage('assets/sponsors/zoriak.png'),
                height: 22,
              ),
            ),
            label: 'Zoriak',
          ),
          NavigationDestination(icon: Icon(Icons.payment), label: 'Pagos'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Perfil'),
        ],
      ),
    );
  }

  int _selectedIndex(BuildContext context) {
    final loc = GoRouterState.of(context).matchedLocation;
    if (loc.startsWith('/doctors')) return 0;
    if (loc.startsWith('/events')) return 1;
    if (loc.startsWith('/zoriak')) return 2;
    if (loc.startsWith('/payments')) return 3;
    if (loc.startsWith('/profile')) return 4;
    return 0;
  }
}
