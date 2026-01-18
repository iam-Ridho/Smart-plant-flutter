import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:index/widgets/cards/display_card/display_card.dart';

class MLPrediction extends StatelessWidget {
  const MLPrediction({super.key});

  @override
  Widget build(BuildContext context) {
    return DisplayCard(
      title: 'ML Prediction',
      value: '0.015%',
      headerTrailing: Icon(Icons.insert_chart, color: Colors.deepOrangeAccent),
      subtitle: 'Normal',
    );
  }
}
