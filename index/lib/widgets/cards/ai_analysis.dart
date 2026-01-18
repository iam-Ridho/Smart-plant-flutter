import 'package:flutter/material.dart';
import 'package:index/widgets/cards/display_card/display_card.dart';

class AiAnalysis extends StatelessWidget {
  const AiAnalysis({super.key});

  @override
  Widget build(BuildContext context) {
    return DisplayCard(title: 'AI Analysis', child: _AIPlantAnalysis());
  }

  Widget _AIPlantAnalysis() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Your Plant Name',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 16,
              color: Colors.green.shade800,
            ),
          ),

          const SizedBox(height: 8,),

          TextField(
            decoration: InputDecoration(
              hintText: 'Name Plant... (example: Kangkung, Bayam, Tomat)',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12)
              )
            ),
          ),

          const SizedBox(height: 8,),

          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.green.withOpacity(0.08),
              borderRadius: BorderRadius.circular(12)
            ),
            child: RichText(text: TextSpan(
              style: TextStyle(fontSize: 14),
              children: [
                TextSpan(
                  text: 'Tip: ',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.green.shade700
                  )
                ),
                const TextSpan(
                  text: 'Write down your plant, AI will automatically identify characteristik and advice.'
                )
              ]
            )),
          )

        ],
      ),
    );
  }
}
