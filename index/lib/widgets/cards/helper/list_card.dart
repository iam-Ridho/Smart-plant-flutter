import 'package:flutter/cupertino.dart';
import 'package:index/widgets/cards/ai_analysis.dart';
import 'package:index/widgets/cards/control_pump.dart';
import 'package:index/widgets/cards/humidity.dart';
import 'package:index/widgets/cards/ml_prediction.dart';
import 'package:index/widgets/cards/moisture.dart';
import 'package:index/widgets/cards/temperature.dart';
import 'package:index/widgets/cards/watering_status.dart';
import 'package:index/widgets/cards/watering_time.dart';

final List<Widget> cards = [
  TemperatureCard(),
  HumidityCard(),
  MoistureCard(),
  MLPrediction(),
  WateringStatus(),
  WateringTime(),
];

final List<Widget> fullWidthCards = [
  ControlPump(),
  AiAnalysis()
];

final items = [
  DashboardItem(TemperatureCard(), 1),
  DashboardItem(HumidityCard(), 1),
  DashboardItem(MoistureCard(), 1),
  DashboardItem(MLPrediction(), 1),
  DashboardItem(WateringTime(), 1),
  DashboardItem(WateringStatus(), 1),
  DashboardItem(ControlPump(), 2),
  DashboardItem(AiAnalysis(), 2)
];

class DashboardItem {
  final Widget widget;
  final int span;

  DashboardItem(this.widget, this.span);
}