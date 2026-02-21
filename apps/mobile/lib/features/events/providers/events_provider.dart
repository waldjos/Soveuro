import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/http/dio_client.dart';

final eventsRepositoryProvider = Provider<EventsRepository>((ref) {
  return EventsRepository(ref.read(dioClientProvider));
});

class EventsRepository {
  EventsRepository(this._dio);
  final dynamic _dio;

  Future<Map<String, dynamic>> list() async {
    final res = await _dio.get<Map<String, dynamic>>('/events');
    return res.data!;
  }
}
