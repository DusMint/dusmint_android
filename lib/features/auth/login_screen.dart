import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'widgets/login_background.dart';
import 'widgets/login_sheet.dart';
import 'controllers/login_controller.dart';

class LoginScreen extends StatefulWidget {
  final Future<void> Function(String phone) sendOtpFn;
  final void Function(String phone) onNavigateToOtp;

  const LoginScreen({
    Key? key,
    required this.sendOtpFn,
    required this.onNavigateToOtp,
  }) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  late final TextEditingController _phoneController;
  late final LoginController _controller;

  @override
  void initState() {
    super.initState();
    _phoneController = TextEditingController();
    _controller = LoginController(
      sendOtpFn: widget.sendOtpFn,
      onSuccess: (phone) {
        widget.onNavigateToOtp(phone);
      },
      onError: (msg) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(msg),
            backgroundColor: const Color(0xFF0F1226),
            behavior: SnackBarBehavior.floating,
          ),
        );
      },
    );
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Force light status bar with dark icons
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
        statusBarBrightness: Brightness.light,
      ),
    );

    return Scaffold(
      resizeToAvoidBottomInset: false, // Prevents background image jumping
      body: GestureDetector(
        onTap: () => FocusScope.of(context).unfocus(),
        behavior: HitTestBehavior.translucent,
        child: Stack(
          children: [
            // 1. Full bleed background image
            const LoginBackground(),

            // 2. Animated bottom sheet for phone entry & continue
            Align(
              alignment: Alignment.bottomCenter,
              child: AnimatedBuilder(
                animation: _controller,
                builder: (context, _) {
                  return LoginSheet(
                    phoneController: _phoneController,
                    errorMessage: _controller.errorMessage,
                    isLoading: _controller.isLoading,
                    isValid: _controller.isValid,
                    onChanged: _controller.onPhoneChanged,
                    onContinue: _controller.submit,
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
