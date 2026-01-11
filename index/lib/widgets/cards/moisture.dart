import 'package:flutter/material.dart';
import 'package:index/widgets/cards/display_card/parts/display_detail_sheet.dart';
import 'package:index/widgets/cards/display_card/display_card.dart';
import 'package:index/widgets/cards/helper/info_detail_sheet.dart';

class MoistureCard extends StatefulWidget {
  const MoistureCard({super.key});

  @override
  State<MoistureCard> createState() => _MoistureCard();
}

class _MoistureCard extends State<MoistureCard> {
  @override
  Widget build(BuildContext context) {
    return DisplayCard(
      title: 'Moisture',
      value: '96%',
      headerTrailing: Icon(Icons.water_drop, color: Colors.blue),
      subtitle: 'Normal',
      onTap: () {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          builder: (_) => DisplayDetailSheet(
            title: 'Moisture',
            content: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                InfoDetailSheet(label: 'Average', value: '95%',),
                SizedBox(height: 8),
                InfoDetailSheet(label: 'Last Update', value: '17 days ago')
              ],
            ),
          ),
        );
      },
    );
  }
}
