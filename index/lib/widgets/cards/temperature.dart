import 'package:flutter/material.dart';
import 'package:index/widgets/cards/display_card/display_card.dart';

class TemperatureCard extends StatefulWidget {
  const TemperatureCard({super.key});

  @override
  State<TemperatureCard> createState() => _TemperatureCard();
}

class _TemperatureCard extends State<TemperatureCard> {
  @override
  Widget build(BuildContext context) {
    return DisplayCard(
      title: 'Temperature',
      value: '26C',
      headerTrailing: Icon(Icons.device_thermostat, color: Colors.red,)
    );
  }
}
