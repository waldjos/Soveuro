import 'package:flutter/material.dart';

import 'svu_logo.dart';

class SvuAppBar extends StatelessWidget implements PreferredSizeWidget {
  const SvuAppBar({
    super.key,
    this.title,
    this.showBack = false,
    this.onBack,
    this.actions,
  });

  final String? title;
  final bool showBack;
  final VoidCallback? onBack;
  final List<Widget>? actions;

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      automaticallyImplyLeading: false,
      leading: showBack
          ? IconButton(
              onPressed: onBack ?? () => Navigator.of(context).maybePop(),
              icon: const Icon(Icons.arrow_back_ios_new_rounded),
            )
          : IconButton(
              onPressed: () {},
              icon: const Icon(Icons.menu_rounded),
            ),
      centerTitle: true,
      title: title == null ? const SvuLogo(height: 26) : Text(title!, style: const TextStyle(fontWeight: FontWeight.w800)),
      actions: actions ??
          const [
            Padding(
              padding: EdgeInsets.only(right: 8),
              child: Icon(Icons.notifications_none_rounded),
            ),
          ],
    );
  }
}

