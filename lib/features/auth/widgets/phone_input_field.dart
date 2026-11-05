import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'india_flag.dart';

class PhoneInputField extends StatefulWidget {
  final TextEditingController controller;
  final bool hasError;
  final VoidCallback? onSubmitted;
  final ValueChanged<String>? onChanged;

  const PhoneInputField({
    Key? key,
    required this.controller,
    this.hasError = false,
    this.onSubmitted,
    this.onChanged,
  }) : super(key: key);

  @override
  State<PhoneInputField> createState() => _PhoneInputFieldState();
}

class _PhoneInputFieldState extends State<PhoneInputField> {
  final FocusNode _focusNode = FocusNode();
  bool _isFocused = false;

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(() {
      setState(() {
        _isFocused = _focusNode.hasFocus;
      });
    });
  }

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    Color borderColor;
    if (widget.hasError) {
      borderColor = const Color(0xFFD32F2F);
    } else if (_isFocused) {
      borderColor = const Color(0xFF047A36);
    } else {
      borderColor = const Color(0xFFCBD5E1);
    }

    return Semantics(
      label: 'Mobile number',
      hint: 'Enter your 10 digit mobile number',
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        height: 58,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: borderColor, width: 1.5),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Row(
          children: [
            // TODO: In future release, support full country picker modal
            const IndiaFlag(width: 24, height: 17),
            const SizedBox(width: 8),
            Text(
              '+91',
              style: GoogleFonts.poppins(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: const Color(0xFF0F1226),
              ),
            ),
            const SizedBox(width: 12),
            Container(
              width: 1,
              height: 28,
              color: const Color(0xFFE2E8F0),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: TextField(
                controller: widget.controller,
                focusNode: _focusNode,
                keyboardType: TextInputType.phone,
                maxLength: 10,
                cursorColor: const Color(0xFF047A36),
                textInputAction: TextInputAction.done,
                autofocus: false,
                autofillHints: const [AutofillHints.telephoneNumberNational],
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  LengthLimitingTextInputFormatter(10),
                ],
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: const Color(0xFF0F1226),
                ),
                decoration: InputDecoration(
                  hintText: 'Enter mobile number',
                  hintStyle: GoogleFonts.poppins(
                    fontSize: 16,
                    fontWeight: FontWeight.w400,
                    color: const Color(0xFF94A3B8),
                  ),
                  border: InputBorder.none,
                  counterText: '',
                  isDense: true,
                  contentPadding: EdgeInsets.zero,
                ),
                onChanged: widget.onChanged,
                onSubmitted: (_) => widget.onSubmitted?.call(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

