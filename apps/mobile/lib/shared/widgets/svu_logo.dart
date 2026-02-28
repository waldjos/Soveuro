import 'package:flutter/material.dart';

enum SvuLogoVariant {
  onLight,
  onDark,
}

class SvuLogo extends StatelessWidget {
  const SvuLogo({
    super.key,
    this.height = 28,
    this.variant = SvuLogoVariant.onLight,
  });

  final double height;
  final SvuLogoVariant variant;

  @override
  Widget build(BuildContext context) {
    final asset = switch (variant) {
      SvuLogoVariant.onLight => 'assets/brand/logo_m.png',
      SvuLogoVariant.onDark => 'assets/brand/logo_w.png',
    };

    return Semantics(
      label: 'Sociedad Venezolana de Urología',
      child: Image.asset(
        asset,
        height: height,
        fit: BoxFit.contain,
        filterQuality: FilterQuality.high,
      ),
    );
  }
}

