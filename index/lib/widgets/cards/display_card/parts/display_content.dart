import 'package:flutter/material.dart';

class DisplayContent extends StatelessWidget {
  final String? value;
  final String? subtitle;
  final TextStyle? valueStyle;
  final TextStyle? subtitleStyle;
  final Widget? child;

  const DisplayContent({
    super.key,
    this.value,
    this.subtitle,
    this.valueStyle,
    this.subtitleStyle,
    this.child,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          if (value != null)
            Text(
              value!,
              textAlign: TextAlign.center,
              style:
                  valueStyle ??
                  theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                    fontSize: 32,
                  ),
            ),

          if (subtitle != null) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.green.withOpacity(0.60),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                subtitle!,
                style:
                    subtitleStyle ??
                    theme.textTheme.labelSmall?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                      fontSize: 10,
                    ),
              ),
            ),
          ],

          if (child != null) ...[const SizedBox(height: 8), child!],
        ],
      ),
    );
  }
}
