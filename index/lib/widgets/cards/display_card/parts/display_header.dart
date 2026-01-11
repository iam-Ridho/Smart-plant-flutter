import 'package:flutter/material.dart';

class DisplayHeader extends StatelessWidget {
  final String title;
  final Color headerColor;
  final Widget? headerTrailing;
  final VoidCallback? onTap;

  const DisplayHeader({
    super.key,
    required this.title,
    required this.headerColor,
    this.headerTrailing,
    this.onTap,
  });

  bool get _isClickable => onTap != null;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: headerColor,
        borderRadius: const BorderRadius.only(
          topRight: Radius.circular(30),
          bottomLeft: Radius.circular(30),
        ),
        gradient: LinearGradient(
          colors: [headerColor, headerColor.withOpacity(0.85)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: theme.textTheme.labelLarge?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),

          if (headerTrailing != null) ...[
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: headerTrailing!,
            ),
          ],

          if (_isClickable) ...[
            const SizedBox(width: 4),
            const Icon(Icons.chevron_right, color: Colors.white70),
          ],
        ],
      ),
    );
  }
}
