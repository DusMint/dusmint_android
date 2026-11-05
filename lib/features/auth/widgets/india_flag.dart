import 'package:flutter/material.dart';

class IndiaFlag extends StatelessWidget {
  final double width;
  final double height;

  const IndiaFlag({
    Key? key,
    this.width = 24,
    this.height = 17,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(2),
        border: Border.all(color: const Color(0xFFE2E8F0), width: 0.5),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          Expanded(child: Container(color: const Color(0xFFFF9933))), // Saffron
          Expanded(
            child: Container(
              color: const Color(0xFFFFFFFF), // White
              child: Center(
                child: Container(
                  width: height * 0.28,
                  height: height * 0.28,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: const Color(0xFF000080), width: 0.6),
                  ),
                  child: Center(
                    child: Container(
                      width: height * 0.1,
                      height: height * 0.1,
                      decoration: const BoxDecoration(
                        color: Color(0xFF000080),
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
          Expanded(child: Container(color: const Color(0xFF138808))), // Green
        ],
      ),
    );
  }
}
