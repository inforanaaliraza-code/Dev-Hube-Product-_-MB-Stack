import 'dart:ui';

import 'package:flutter/material.dart';
import '../../core/colors.dart';

class HomeHeroVisual extends StatelessWidget {
  const HomeHeroVisual({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 148,
      height: 168,
      child: Stack(
        clipBehavior: Clip.none,
        alignment: Alignment.center,
        children: [
          Positioned(
            top: 8,
            right: 0,
            child: _floatIcon(Icons.lock_outline, AppColors.aurora2, 28),
          ),
          Positioned(
            left: 0,
            top: 48,
            child: _floatIcon(Icons.terminal, AppColors.accent, 26),
          ),
          Positioned(
            right: 4,
            bottom: 24,
            child: _floatIcon(Icons.bolt, const Color(0xFFFBBF24), 26),
          ),
          Positioned(
            left: 12,
            bottom: 8,
            child: _floatIcon(Icons.palette_outlined, AppColors.aurora3, 26),
          ),
          ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
              child: Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      AppColors.primary.withValues(alpha: 0.25),
                      AppColors.aurora3.withValues(alpha: 0.12),
                    ],
                  ),
                  border: Border.all(color: AppColors.border),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.35),
                      blurRadius: 28,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: const Icon(Icons.code, size: 44, color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _floatIcon(IconData icon, Color color, double size) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: AppColors.muted,
        shape: BoxShape.circle,
        border: Border.all(color: color.withValues(alpha: 0.45)),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.35),
            blurRadius: 10,
          ),
        ],
      ),
      child: Icon(icon, size: size * 0.48, color: color),
    );
  }
}
