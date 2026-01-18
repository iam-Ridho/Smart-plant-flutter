import 'package:flutter/material.dart';
import 'package:index/widgets/cards/display_card/parts/display_content.dart';
import 'package:index/widgets/cards/display_card/parts/display_header.dart';

class DisplayCard extends StatelessWidget {
  final String title;
  final String? value;
  final String? subtitle;
  final Color headerColor;
  final TextStyle? valueStyle;
  final TextStyle? subtitleStyle;
  final Widget? headerTrailing;
  final VoidCallback? onTap;
  final Widget? child;

  const DisplayCard({
    super.key,
    required this.title,
    this.value,
    this.subtitle,
    this.headerColor = Colors.green,
    this.valueStyle,
    this.subtitleStyle,
    this.headerTrailing,
    this.onTap,
    this.child
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 3,
      shadowColor: Colors.black.withOpacity(0.12),
      clipBehavior: Clip.antiAlias,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topRight: Radius.circular(30),
          bottomLeft: Radius.circular(30),
        ),
      ),
      child: InkWell(
        onTap: onTap,
        splashColor: Colors.white.withOpacity(0.4),
        highlightColor: Colors.white.withOpacity(0.4),
        borderRadius: const BorderRadius.only(
          topRight: Radius.circular(30),
          bottomLeft: Radius.circular(30),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            DisplayHeader(
              title: title,
              headerColor: headerColor,
              headerTrailing: headerTrailing,
              onTap: onTap,
            ),

            const SizedBox(height: 4),

            //Content
            DisplayContent(
              value: value,
              subtitle: subtitle,
              valueStyle: valueStyle,
              subtitleStyle: subtitleStyle,
              child: child,
            ),
          ],
        ),
      ),
    );
  }
}
