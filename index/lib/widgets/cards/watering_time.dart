import 'package:flutter/material.dart';
import 'package:index/widgets/cards/display_card/display_card.dart';

class WateringTime extends StatelessWidget {
  const WateringTime({super.key});

  @override
  Widget build(BuildContext context) {
    return DisplayCard(
      title: 'Watering Time',
      value: '2 Days 1 Hour',
      headerTrailing: Icon(Icons.access_alarm_outlined, color: Colors.cyan,),
      valueStyle: Theme.of(context).textTheme.headlineSmall?.copyWith(
        fontSize: 18,
        fontWeight: FontWeight.bold,
      ),
    );
  }
}
