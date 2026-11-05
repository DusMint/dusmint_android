import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class SplashScreen extends StatefulWidget {
  final Future<bool> Function() checkAuthState;
  final VoidCallback onAuthenticated;
  final VoidCallback onUnauthenticated;

  const SplashScreen({
    Key? key,
    required this.checkAuthState,
    required this.onAuthenticated,
    required this.onUnauthenticated,
  }) : super(key: key);

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  static const _bgAsset = 'assets/images/login_bg.jpg';

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    precacheImage(const AssetImage(_bgAsset), context);
  }

  @override
  void initState() {
    super.initState();
    _handleRouting();
  }

  Future<void> _handleRouting() async {
    // Transparent status bar with dark icons
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
        statusBarBrightness: Brightness.light,
      ),
    );

    // Hold for ~1.2s while resolving session
    await Future.wait([
      Future.delayed(const Duration(milliseconds: 1200)),
      widget.checkAuthState(),
    ]).then((results) {
      if (!mounted) return;
      final bool isLoggedIn = results[1] as bool? ?? false;
      if (isLoggedIn) {
        widget.onAuthenticated();
      } else {
        widget.onUnauthenticated();
      }
    }).catchError((_) {
      if (!mounted) return;
      widget.onUnauthenticated();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SizedBox.expand(
        child: Image.asset(
          _bgAsset,
          fit: BoxFit.cover,
          alignment: Alignment.topCenter,
        ),
      ),
    );
  }
}
