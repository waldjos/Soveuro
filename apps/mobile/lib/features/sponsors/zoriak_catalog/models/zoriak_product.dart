class ZoriakProduct {
  const ZoriakProduct({
    required this.id,
    required this.brandName,
    required this.activeIngredient,
    required this.strength,
    required this.form,
    required this.pack,
    required this.category,
    required this.primaryAsset,
    required this.assets,
    required this.shortDescription,
    required this.about,
    required this.commonUses,
    required this.cautions,
  });

  final String id;
  final String brandName;
  final String activeIngredient;
  final String strength;
  final String form;
  final String pack;
  final String category;

  final String primaryAsset;
  final List<String> assets;

  final String shortDescription;
  final String about;
  final List<String> commonUses;
  final List<String> cautions;
}

