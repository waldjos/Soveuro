class LocalEvent {
  const LocalEvent({
    required this.id,
    required this.title,
    required this.dateLabel,
    required this.locationLabel,
    required this.assetPath,
    this.webUrl,
    this.contactUrl,
  });

  final String id;
  final String title;
  final String dateLabel;
  final String locationLabel;
  final String assetPath;
  final String? webUrl;
  final String? contactUrl;
}

const kLocalEvents = <LocalEvent>[
  LocalEvent(
    id: 'local-1',
    title: 'Jornada de Uro-Oncología “Dr. Rafael Simón Paz Álvarez”',
    dateLabel: '27–28 Febrero 2026',
    locationLabel: 'Hotel Hesperia, Maracay',
    assetPath: 'assets/events/event_1.png',
    webUrl: 'https://soveuro.org/',
    contactUrl: 'https://api.whatsapp.com/send?phone=584143321005',
  ),
  LocalEvent(
    id: 'local-2',
    title: 'Congreso ALAPP 2026',
    dateLabel: '04–07 Marzo 2026',
    locationLabel: 'Delfines Hotel & Centro de Convenciones, Lima (Perú)',
    assetPath: 'assets/events/event_2.png',
    webUrl: 'https://soveuro.org/',
    contactUrl: 'https://api.whatsapp.com/send?phone=584143321005',
  ),
  LocalEvent(
    id: 'local-3',
    title: 'XXXVI Congreso Venezolano de Urología “Dr. Nelson Medero”',
    dateLabel: '08–11 Julio 2026',
    locationLabel: 'Venezuela',
    assetPath: 'assets/events/event_3.png',
    webUrl: 'https://soveuro.org/',
    contactUrl: 'https://api.whatsapp.com/send?phone=584143321005',
  ),
];

LocalEvent? localEventById(String id) {
  for (final e in kLocalEvents) {
    if (e.id == id) return e;
  }
  return null;
}

