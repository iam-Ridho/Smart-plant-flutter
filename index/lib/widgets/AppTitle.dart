import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTitle extends StatelessWidget {
  final bool center;

  const AppTitle({super.key, this.center = false});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Image(image: AssetImage('assets/images/potPlant.png'), width: 24, height: 24,),
        const SizedBox(width: 8),
        Text(
          'Smart Plant',
          style: GoogleFonts.aoboshiOne(
            textStyle: const TextStyle(fontSize: 30),
          ),
        ),
      ],
    );
  }
}
