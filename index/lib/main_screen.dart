import 'package:flutter/material.dart';
import 'package:index/widgets/AppTitle.dart';
import 'package:index/widgets/cards/helper/list_card.dart';

class MainScreen extends StatelessWidget {
  const MainScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(appBar: _buildAppBar(), body: _buildBody(context), backgroundColor: const Color(0xFFF6F8FB),);
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(title: AppTitle(center: true), centerTitle: true);
  }

  Widget _buildBody(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth <= 600) {
          return _MobileLayout();
        } else if (constraints.maxWidth <= 1024) {
          return _TabletLayout();
        } else {
          return _DesktopLayout();
        }
      },
    );
  }
}

class _MobileLayout extends StatelessWidget {
  const _MobileLayout({super.key});

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.all(12),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 1.1,
      ),
      itemCount: cards.length,
      itemBuilder: (context, index) => cards[index],
    );

  }
}

class _TabletLayout extends StatelessWidget {
  const _TabletLayout({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView();
  }
}

class _DesktopLayout extends StatelessWidget {
  const _DesktopLayout({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView();
  }
}
