import 'package:flutter/material.dart';

class LoginBackground extends StatelessWidget {
  const LoginBackground({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Positioned.fill(
      child: Container(
        color: const Color(0xFFF6EFDD), // Fallback loading tint
        child: Image.asset(
          'assets/images/login_bg.jpg',
          fit: BoxFit.cover,
          alignment: Alignment.topCenter,
          errorBuilder: (_, __, ___) => const ColoredBox(color: Color(0xFFF6EFDD)),
        ),
      ),
    );
  }
}

