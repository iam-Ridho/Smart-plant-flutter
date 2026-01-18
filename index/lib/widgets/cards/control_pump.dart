import 'package:flutter/material.dart';
import 'package:index/widgets/cards/display_card/display_card.dart';

class ControlPump extends StatefulWidget {
  const ControlPump({super.key});

  @override
  State<ControlPump> createState() => _ControlPumpState();
}

class _ControlPumpState extends State<ControlPump> {
  bool isPumpOn = false;
  bool isAuto = false;

  @override
  Widget build(BuildContext context) {
    return DisplayCard(
      title: 'Control Pump',
      value: isPumpOn ? 'ON' : 'OFF',
      subtitle: isAuto ? 'AUTO MODE' : 'MANUAL MODE',
      valueStyle: Theme.of(context).textTheme.headlineSmall?.copyWith(
        fontWeight: FontWeight.bold,
        color: isPumpOn ? Colors.green : Colors.red,
      ),
      subtitleStyle: const TextStyle(fontSize: 12),
      onTap: null,
      child: _buildControls(),
    );
  }

  Widget _buildControls() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Auto Mode'),
              Switch(
                value: isAuto,
                onChanged: (value) {
                  setState(() {
                    isAuto = value;
                  });

                  // TODO: kirim ke backend

                },
              ),
            ],
          ),

          if(!isAuto)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Pump'),
                Switch(
                  value: isPumpOn,
                  activeColor: Colors.green,
                  onChanged: (value) {
                    setState(() {
                      isPumpOn = value;
                    });

                    // TODO: kirim ke backend / MQTT
                  },
                ),
              ],
            ),

        ],
      ),
    );
  }
}
