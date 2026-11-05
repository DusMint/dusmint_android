import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'phone_input_field.dart';
import 'primary_button.dart';

class LoginSheet extends StatelessWidget {
  final TextEditingController phoneController;
  final String? errorMessage;
  final bool isLoading;
  final bool isValid;
  final VoidCallback onContinue;
  final ValueChanged<String>? onChanged;

  const LoginSheet({
    Key? key,
    required this.phoneController,
    this.errorMessage,
    this.isLoading = false,
    this.isValid = false,
    required this.onContinue,
    this.onChanged,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    return AnimatedPadding(
      duration: const Duration(milliseconds: 200),
      curve: Curves.easeOut,
      padding: EdgeInsets.only(bottom: bottomInset),
      child: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          boxShadow: [
            BoxShadow(
              color: Color(0x14000000),
              offset: Offset(0, -4),
              blurRadius: 16,
            ),
          ],
        ),
        padding: EdgeInsets.fromLTRB(18, 24, 18, 16 + bottomPadding),
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // a) "Login" Header
              Semantics(
                header: true,
                child: Text(
                  'Login',
                  style: GoogleFonts.poppins(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF0F1226),
                  ),
                ),
              ),

              // b) 12px gap, "Enter phone number to proceed"
              const SizedBox(height: 12),
              Text(
                'Enter phone number to proceed',
                style: GoogleFonts.poppins(
                  fontSize: 15,
                  fontWeight: FontWeight.w400,
                  color: const Color(0xFF4B5B73),
                ),
              ),

              // c) 26px gap, caption "PHONE NUMBER"
              const SizedBox(height: 26),
              Text(
                'PHONE NUMBER',
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.8,
                  color: const Color(0xFF4B5B73),
                ),
              ),

              // d) 10px gap, PhoneInputField
              const SizedBox(height: 10),
              PhoneInputField(
                controller: phoneController,
                hasError: errorMessage != null && errorMessage!.isNotEmpty,
                onSubmitted: onContinue,
                onChanged: onChanged,
              ),

              // e) Inline error text
              AnimatedSize(
                duration: const Duration(milliseconds: 200),
                child: (errorMessage != null && errorMessage!.isNotEmpty)
                    ? Padding(
                        padding: const EdgeInsets.only(top: 6, left: 4),
                        child: Text(
                          errorMessage!,
                          style: GoogleFonts.poppins(
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                            color: const Color(0xFFD32F2F),
                          ),
                        ),
                      )
                    : const SizedBox.shrink(),
              ),

              // f) 20px gap, PrimaryButton "CONTINUE"
              const SizedBox(height: 20),
              PrimaryButton(
                label: 'CONTINUE',
                onPressed: onContinue,
                loading: isLoading,
                disabled: !isValid && phoneController.text.isEmpty,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
