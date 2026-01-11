import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:index/widgets/cards/temperature.dart';

void main() {
  testWidgets('TemperatureCard renders correctly', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: TemperatureCard(),
        ),
      ),
    );

    expect(find.text('Temperature'), findsOneWidget);
    expect(find.textContaining('°C'), findsOneWidget);
  });
}
