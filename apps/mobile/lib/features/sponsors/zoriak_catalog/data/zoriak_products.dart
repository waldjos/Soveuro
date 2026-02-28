import '../models/zoriak_product.dart';

const kZoriakProducts = <ZoriakProduct>[
  ZoriakProduct(
    id: 'dutapros-05',
    brandName: 'Dutapros',
    activeIngredient: 'Dutasterida',
    strength: '0,5 mg',
    form: 'Cápsulas',
    pack: 'Caja x 30',
    category: 'Próstata',
    primaryAsset: 'assets/sponsors/zoriak_catalog/ZORIAK_DUTAPROS_01.jpg',
    assets: [
      'assets/sponsors/zoriak_catalog/ZORIAK_DUTAPROS_01.jpg',
      'assets/sponsors/zoriak_catalog/ZORIAK_DUTAPROS_02.jpg',
      'assets/sponsors/zoriak_catalog/ZORIAK_DUTAPROS_03.jpg',
    ],
    shortDescription: 'Inhibidor de 5-alfa reductasa (HPB).',
    about:
        'Dutasterida es un inhibidor de la 5-alfa reductasa que reduce la conversión de testosterona a dihidrotestosterona (DHT).',
    commonUses: [
      'Tratamiento de síntomas asociados a hiperplasia prostática benigna (HPB).',
      'Puede usarse sola o combinada según indicación médica.',
    ],
    cautions: [
      'Uso bajo prescripción médica; no usar en mujeres ni menores.',
      'Puede tardar semanas/meses en mostrar beneficio.',
    ],
  ),
  ZoriakProduct(
    id: 'tamduride-04-05',
    brandName: 'Tamduride',
    activeIngredient: 'Tamsulosina + Dutasterida',
    strength: '0,4 mg + 0,5 mg',
    form: 'Cápsulas',
    pack: 'Caja x 30',
    category: 'Próstata',
    primaryAsset: 'assets/sponsors/zoriak_catalog/ZORIAK_TAMDURIDE_01.jpg',
    assets: [
      'assets/sponsors/zoriak_catalog/ZORIAK_TAMDURIDE_01.jpg',
      'assets/sponsors/zoriak_catalog/ZORIAK_TAMDURIDE_02.jpg',
      'assets/sponsors/zoriak_catalog/ZORIAK_TAMDURIDE_03.jpg',
    ],
    shortDescription: 'Combinación para síntomas urinarios por HPB.',
    about:
        'La combinación une un alfa-bloqueante (tamsulosina) con un inhibidor de 5-alfa reductasa (dutasterida).',
    commonUses: [
      'Manejo de síntomas urinarios por hiperplasia prostática benigna (HPB) en hombres.',
      'Puede mejorar el flujo urinario y ayudar a reducir el crecimiento prostático.',
    ],
    cautions: [
      'Puede causar mareos por bajada de tensión, especialmente al levantarse.',
      'No abrir ni masticar cápsulas (según indicación del producto).',
    ],
  ),
  ZoriakProduct(
    id: 'tamsupros-04',
    brandName: 'Tamsupros',
    activeIngredient: 'Tamsulosina clorhidrato',
    strength: '0,4 mg',
    form: 'Cápsulas',
    pack: 'Caja x 30',
    category: 'Próstata',
    primaryAsset: 'assets/sponsors/zoriak_catalog/ZORIAK_TAMSUPROS_01.jpg',
    assets: [
      'assets/sponsors/zoriak_catalog/ZORIAK_TAMSUPROS_01.jpg',
      'assets/sponsors/zoriak_catalog/ZORIAK_TAMSUPROS_02.jpg',
      'assets/sponsors/zoriak_catalog/ZORIAK_TAMSUPROS_03.jpg',
    ],
    shortDescription: 'Alfa-bloqueante para síntomas urinarios (HPB).',
    about:
        'Tamsulosina es un antagonista alfa-1 selectivo que relaja músculo liso en próstata y cuello vesical.',
    commonUses: [
      'Alivio de síntomas urinarios por hiperplasia prostática benigna (HPB).',
    ],
    cautions: [
      'Puede causar mareos; precaución al conducir si hay hipotensión.',
      'Informar al oftalmólogo si hay cirugía de cataratas (según indicación médica).',
    ],
  ),
  ZoriakProduct(
    id: 'prosilod-8',
    brandName: 'Prosilod',
    activeIngredient: 'Silodosina',
    strength: '8 mg',
    form: 'Cápsulas',
    pack: 'Caja x 30',
    category: 'Próstata',
    primaryAsset: 'assets/sponsors/zoriak_catalog/ZORIAK_PROSILOD_1000px_01.jpg',
    assets: [
      'assets/sponsors/zoriak_catalog/ZORIAK_PROSILOD_1000px_01.jpg',
      'assets/sponsors/zoriak_catalog/ZORIAK_PROSILOD_1000px_02.jpg',
      'assets/sponsors/zoriak_catalog/ZORIAK_PROSILOD_1000px_03.jpg',
    ],
    shortDescription: 'Alfa-bloqueante selectivo (HPB).',
    about:
        'Silodosina es un antagonista alfa-1A selectivo que ayuda a relajar músculo liso en próstata y vías urinarias.',
    commonUses: [
      'Alivio de síntomas del tracto urinario inferior asociados a HPB.',
    ],
    cautions: [
      'Puede causar mareos/hipotensión ortostática en algunos pacientes.',
      'Puede producir cambios en la eyaculación (efecto conocido de la clase).',
    ],
  ),
  ZoriakProduct(
    id: 'urigron-25',
    brandName: 'Urigron',
    activeIngredient: 'Mirabegrón',
    strength: '25 mg',
    form: 'Tabletas de liberación extendida',
    pack: 'Caja x 30',
    category: 'Vejiga',
    primaryAsset: 'assets/sponsors/zoriak_catalog/ZORIAK_URIGRON_1000px_01.jpg',
    assets: [
      'assets/sponsors/zoriak_catalog/ZORIAK_URIGRON_1000px_01.jpg',
      'assets/sponsors/zoriak_catalog/ZORIAK_URIGRON_1000px_02.jpg',
      'assets/sponsors/zoriak_catalog/ZORIAK_URIGRON_1000px_03.jpg',
    ],
    shortDescription: 'Agonista beta-3 (vejiga hiperactiva).',
    about:
        'Mirabegrón es un agonista beta-3 adrenérgico que ayuda a relajar el músculo detrusor y mejorar el almacenamiento de orina.',
    commonUses: [
      'Síntomas de vejiga hiperactiva (urgencia, frecuencia, incontinencia de urgencia) bajo evaluación médica.',
    ],
    cautions: [
      'Puede aumentar la presión arterial; requiere control clínico según el caso.',
      'No partir ni triturar tabletas de liberación extendida.',
    ],
  ),
  ZoriakProduct(
    id: 'uroxtin-5',
    brandName: 'Uroxtin',
    activeIngredient: 'Oxibutinina clorhidrato',
    strength: '5 mg',
    form: 'Tabletas',
    pack: 'Caja x 30',
    category: 'Vejiga',
    primaryAsset: 'assets/sponsors/zoriak_catalog/ZORIAK_UROXTIN_1000.jpg',
    assets: [
      'assets/sponsors/zoriak_catalog/ZORIAK_UROXTIN_1000.jpg',
      'assets/sponsors/zoriak_catalog/ZORIAK_UROXTIN_1000_01.jpg',
      'assets/sponsors/zoriak_catalog/ZORIAK_UROXTIN_1000_02.jpg',
    ],
    shortDescription: 'Antimuscarínico para síntomas de vejiga hiperactiva.',
    about:
        'Oxibutinina es un antimuscarínico que puede reducir espasmos del músculo de la vejiga y la urgencia urinaria.',
    commonUses: [
      'Síntomas de vejiga hiperactiva bajo indicación médica.',
    ],
    cautions: [
      'Puede causar boca seca, estreñimiento o somnolencia en algunos pacientes.',
      'Precaución en glaucoma de ángulo estrecho y retención urinaria (según evaluación médica).',
    ],
  ),
  ZoriakProduct(
    id: 'ceftitan-400',
    brandName: 'Ceftitan',
    activeIngredient: 'Ceftibuteno',
    strength: '400 mg',
    form: 'Cápsulas',
    pack: 'Caja x 10',
    category: 'Antibióticos',
    primaryAsset: 'assets/sponsors/zoriak_catalog/ZORIAK_CEFTITAN_01.jpg',
    assets: [
      'assets/sponsors/zoriak_catalog/ZORIAK_CEFTITAN_01.jpg',
      'assets/sponsors/zoriak_catalog/ZORIAK_CEFTITAN_02.jpg',
      'assets/sponsors/zoriak_catalog/ZORIAK_CEFTITAN_03.jpg',
    ],
    shortDescription: 'Cefalosporina oral (uso antibiótico).',
    about:
        'Ceftibuteno es una cefalosporina oral indicada para infecciones causadas por bacterias sensibles, bajo prescripción.',
    commonUses: [
      'Infecciones bacterianas susceptibles según criterio médico (por ejemplo, algunas infecciones respiratorias o urinarias).',
    ],
    cautions: [
      'No usar antibióticos sin indicación; completar esquema según prescripción.',
      'Consultar si hay alergia a penicilinas/cefalosporinas.',
    ],
  ),
  ZoriakProduct(
    id: 'ciprotan-500',
    brandName: 'Ciprotan',
    activeIngredient: 'Ciprofloxacina',
    strength: '500 mg',
    form: 'Tabletas recubiertas',
    pack: 'Caja x 20',
    category: 'Antibióticos',
    primaryAsset: 'assets/sponsors/zoriak_catalog/ZORIAK_BCIPROTAN_01.jpg',
    assets: [
      'assets/sponsors/zoriak_catalog/ZORIAK_BCIPROTAN_01.jpg',
      'assets/sponsors/zoriak_catalog/ZORIAK_BCIPROTAN_02.jpg',
      'assets/sponsors/zoriak_catalog/ZORIAK_BCIPROTAN_03.jpg',
    ],
    shortDescription: 'Fluoroquinolona (uso antibiótico).',
    about:
        'Ciprofloxacina es una fluoroquinolona usada para infecciones por bacterias susceptibles, bajo prescripción.',
    commonUses: [
      'Infecciones bacterianas susceptibles según criterio médico (por ejemplo, algunas infecciones urinarias).',
    ],
    cautions: [
      'Uso bajo prescripción; evitar automedicación y completar esquema.',
      'Comentar al médico antecedentes de tendinopatía o efectos previos con quinolonas.',
    ],
  ),
];

const kZoriakCatalogDisclaimer =
    'Información general para fines informativos. No sustituye la evaluación de un profesional de salud ni el prospecto del producto.';

