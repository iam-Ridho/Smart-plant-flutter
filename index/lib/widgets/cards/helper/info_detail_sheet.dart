import 'package:flutter/material.dart';

class InfoDetailSheet extends StatelessWidget {
  final String label;
  final String value;

  const InfoDetailSheet({
    super.key,
    required this.label,
    required this.value
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(2),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 2,),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16), softWrap: true,)
        ],
      ),
    );
  }

}