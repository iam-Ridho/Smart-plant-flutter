import 'package:flutter/material.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:index/widgets/AppTitle.dart';
import 'package:index/widgets/cards/helper/list_card.dart';

class MainScreen extends StatelessWidget {
  const MainScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _buildAppBar(),
      body: _buildBody(context),
      backgroundColor: const Color(0xFFF6F8FB),
    );
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
    return CustomScrollView(
      slivers: [

        SliverPadding(
          padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
          sliver: SliverMasonryGrid(
            delegate: SliverChildBuilderDelegate(
                  (context, index) => cards[index],
              childCount: cards.length,
            ),
            gridDelegate: const SliverSimpleGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
            ),
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
          ),
        ),

        SliverPadding(
          padding: const EdgeInsets.all(12),
          sliver: SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, index) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: fullWidthCards[index],
              ),
              childCount: fullWidthCards.length,
            ),
          ),
        ),

      ],
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
