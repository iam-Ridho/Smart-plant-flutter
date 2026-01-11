import 'package:flutter/material.dart';
import 'package:index/widgets/cards/display_card/display_card.dart';

class HumidityCard extends StatefulWidget {
  const HumidityCard({super.key});

  @override
  State<HumidityCard> createState() => _HumidityCard();
}

class _HumidityCard extends State<HumidityCard> {
  @override
  Widget build(BuildContext context) {
    return DisplayCard(
      title: 'Humidity',
      value: '40%',
      headerTrailing: Icon(Icons.foggy, color: Colors.lightBlue),
    );
  }
}
