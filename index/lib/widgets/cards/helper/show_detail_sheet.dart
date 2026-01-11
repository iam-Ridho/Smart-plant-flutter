import 'package:flutter/material.dart';
import 'package:index/widgets/cards/display_card/parts/display_detail_sheet.dart';

Future<void> showDetailSheet({
  required BuildContext context,
  required String title,
  required Widget content,
}) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    builder: (_) => DisplayDetailSheet(title: title, content: content),
  );
}
