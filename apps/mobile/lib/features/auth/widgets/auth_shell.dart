import 'package:flutter/material.dart';
import '../../../shared/widgets/svu_logo.dart';

class AuthShell extends StatelessWidget {
  const AuthShell({
    super.key,
    required this.child,
  });

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(color: Theme.of(context).colorScheme.surface),
            ),
          ),
          const Positioned.fill(child: _BottomWaves()),
          SafeArea(
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 520),
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                  child: child,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

@Deprecated('Usa SvuLogo (shared/widgets).')
class SoveuroLogo extends SvuLogo {
  const SoveuroLogo({super.key, super.height = 28});
}

class _BottomWaves extends StatelessWidget {
  const _BottomWaves();

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Align(
        alignment: Alignment.bottomCenter,
        child: SizedBox(
          height: 240,
          width: double.infinity,
          child: CustomPaint(
            painter: _WavesPainter(
              primary: const Color(0xFFF6D36B),
              secondary: const Color(0xFFFBE7A6),
            ),
          ),
        ),
      ),
    );
  }
}

class _WavesPainter extends CustomPainter {
  _WavesPainter({required this.primary, required this.secondary});

  final Color primary;
  final Color secondary;

  @override
  void paint(Canvas canvas, Size size) {
    final paint1 = Paint()..color = secondary.withValues(alpha: 0.75);
    final paint2 = Paint()..color = primary;

    final h = size.height;
    final w = size.width;

    final path1 = Path()
      ..moveTo(0, h * 0.55)
      ..quadraticBezierTo(w * 0.25, h * 0.35, w * 0.55, h * 0.55)
      ..quadraticBezierTo(w * 0.8, h * 0.72, w, h * 0.52)
      ..lineTo(w, h)
      ..lineTo(0, h)
      ..close();

    final path2 = Path()
      ..moveTo(0, h * 0.7)
      ..quadraticBezierTo(w * 0.32, h * 0.95, w * 0.62, h * 0.78)
      ..quadraticBezierTo(w * 0.85, h * 0.65, w, h * 0.82)
      ..lineTo(w, h)
      ..lineTo(0, h)
      ..close();

    canvas.drawPath(path1, paint1);
    canvas.drawPath(path2, paint2);
  }

  @override
  bool shouldRepaint(covariant _WavesPainter oldDelegate) {
    return oldDelegate.primary != primary || oldDelegate.secondary != secondary;
  }
}

