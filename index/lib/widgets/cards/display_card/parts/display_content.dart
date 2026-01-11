import 'package:flutter/material.dart';

class DisplayContent extends StatelessWidget {
  final String value;
  final String? subtitle;
  final TextStyle? valueStyle;
  final TextStyle? subtitleStyle;

  const DisplayContent({
    super.key,
    required this.value,
    this.subtitle,
    this.valueStyle,
    this.subtitleStyle,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              value,
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
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 4,
                ),
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
          ],
        ),
      ),
    );
  }
}
