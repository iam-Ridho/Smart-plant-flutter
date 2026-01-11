import 'package:flutter/material.dart';
import 'package:index/widgets/cards/display_card/parts/display_detail_sheet.dart';
import 'package:index/widgets/cards/display_card/display_card.dart';

class WateringStatus extends StatefulWidget {
  const WateringStatus({super.key});

  @override
  State<WateringStatus> createState() => _WateringStatus();
}

class _WateringStatus extends State<WateringStatus> {
  @override
  Widget build(BuildContext context) {
    return DisplayCard(
      title: 'Status Watering',
      value: 'Last Update : 17 Days 2 Hour Ago',
      subtitle: 'Active',
      valueStyle: Theme.of(context).textTheme.headlineSmall?.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.bold,
      ),
      subtitleStyle: Theme.of(context).textTheme.labelSmall?.copyWith(
        color: Colors.white,
        fontWeight: FontWeight.w600,
        fontSize: 10,
      ),
      headerColor: Colors.lightBlue,
      headerTrailing: Icon(Icons.shower_outlined, color: Colors.white70),
      onTap: () {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          builder: (_) => DisplayDetailSheet(
            title: 'Status Watering',
            content: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('Last Watering'),
                SizedBox(height: 8),
                Text('Wednesday, 17 December 2025'),
                SizedBox(height: 16),
                Text('Prediction'),
                Text('Next watering in 2 days'),
              ],
            ),
          ),
        );
      },
    );
  }
}
