import 'package:flutter/foundation.dart';

class LoginController extends ChangeNotifier {
  final Future<void> Function(String phone) sendOtpFn;
  final void Function(String phone) onSuccess;
  final void Function(String message) onError;

  String _phone = '';
  String? _errorMessage;
  bool _isLoading = false;

  LoginController({
    required this.sendOtpFn,
    required this.onSuccess,
    required this.onError,
  });

  String get phone => _phone;
  String? get errorMessage => _errorMessage;
  bool get isLoading => _isLoading;

  bool get isValid {
    final clean = _phone.trim();
    return clean.length == 10 && RegExp(r'^[6-9]\d{9}$').hasMatch(clean);
  }

  void onPhoneChanged(String value) {
    _phone = value;
    if (_errorMessage != null) {
      _errorMessage = null;
      notifyListeners();
    }
  }

  Future<void> submit() async {
    final clean = _phone.trim();
    if (!isValid) {
      _errorMessage = 'Please enter a valid 10-digit mobile number';
      notifyListeners();
      return;
    }

    _errorMessage = null;
    _isLoading = true;
    notifyListeners();

    try {
      await sendOtpFn('+91$clean');
      _isLoading = false;
      notifyListeners();
      onSuccess(clean);
    } catch (e) {
      _isLoading = false;
      final msg = e.toString().replaceAll('Exception:', '').trim();
      _errorMessage = msg.isNotEmpty ? msg : 'Could not send OTP. Please try again.';
      notifyListeners();
      onError(_errorMessage!);
    }
  }
}
