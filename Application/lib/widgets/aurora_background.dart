import 'package:flutter/material.dart';
import '../core/colors.dart';

class AuroraBackground extends StatelessWidget {
  const AuroraBackground({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          decoration: const BoxDecoration(
            color: AppColors.background,
            gradient: RadialGradient(
              center: Alignment(-0.8, -0.9),
              radius: 1.2,
              colors: [Color(0x617C3AED), Colors.transparent],
            ),
          ),
        ),
        Container(
          decoration: const BoxDecoration(
            gradient: RadialGradient(
              center: Alignment(1.1, -0.2),
              radius: 1,
              colors: [Color(0x4DEC4899), Colors.transparent],
            ),
          ),
        ),
        Container(
          decoration: const BoxDecoration(
            gradient: RadialGradient(
              center: Alignment(0.5, 1.2),
              radius: 1.1,
              colors: [Color(0x4D14B8A6), Colors.transparent],
            ),
          ),
        ),
        child,
      ],
    );
  }
}
