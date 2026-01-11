import 'package:flutter/material.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:index/widgets/cards/temperature.dart';

void main() {
  runApp(const TemperatureCardPreview());
}

class TemperatureCardPreview extends StatelessWidget {
  const TemperatureCardPreview({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(textTheme: GoogleFonts.poppinsTextTheme()),
      home: Scaffold(
        backgroundColor: Color(0xFFF2F2F2),
        body: Padding(
          padding: const EdgeInsets.all(12),
          child: MasonryGridView.count(
            crossAxisCount: 2,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            itemCount: 2,
            itemBuilder: (context, index) {
              return const TemperatureCard();
            },
          ),
        ),
      ),
    );
  }
}
