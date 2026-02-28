import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/admin_repository.dart';

final adminAuditProvider = StreamProvider.autoDispose<List<Map<String, dynamic>>>((ref) async* {
  // Polling simple y estable (2–5s). Emite de inmediato y luego repite.
  while (true) {
    final items = await ref.read(adminRepositoryProvider).listAudit(limit: 30);
    yield items;
    await Future<void>.delayed(const Duration(seconds: 3));
  }
});

final adminDoctorApplicationsFilterProvider = StateProvider<String?>((_) => 'PENDING');

final adminDoctorApplicationsProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final status = ref.watch(adminDoctorApplicationsFilterProvider);
  return ref.read(adminRepositoryProvider).listDoctorApplications(status: status, page: 1, limit: 30);
});

final adminDoctorApplicationProvider = FutureProvider.autoDispose.family<Map<String, dynamic>, String>((ref, id) async {
  return ref.read(adminRepositoryProvider).getDoctorApplication(id);
});

