import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/doctors_provider.dart';

class DoctorDetailScreen extends ConsumerStatefulWidget {
  const DoctorDetailScreen({super.key, required this.doctorId});

  final String doctorId;

  @override
  ConsumerState<DoctorDetailScreen> createState() => _DoctorDetailScreenState();
}

class _DoctorDetailScreenState extends ConsumerState<DoctorDetailScreen> {
  Map<String, dynamic>? _doctor;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final data = await ref.read(doctorsRepositoryProvider).getById(widget.doctorId);
      setState(() {
        _doctor = data;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (_error != null || _doctor == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Doctor')),
        body: Center(child: Text(_error ?? 'No encontrado')),
      );
    }
    final d = _doctor!;
    return Scaffold(
      appBar: AppBar(title: Text(d['fullName'] as String? ?? 'Doctor')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: CircleAvatar(
                radius: 48,
                backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                child: Text(
                  ((d['fullName'] as String? ?? '?').isNotEmpty ? (d['fullName'] as String).substring(0, 1).toUpperCase() : '?'),
                  style: Theme.of(context).textTheme.headlineLarge,
                ),
              ),
            ),
            const SizedBox(height: 16),
            if (d['verified'] == true) Row(children: [const Icon(Icons.verified, color: Colors.blue, size: 20), const SizedBox(width: 4), Text('Verificado', style: Theme.of(context).textTheme.labelLarge)]),
            const SizedBox(height: 8),
            Text(d['specialty'] ?? '', style: Theme.of(context).textTheme.titleMedium),
            if (d['city'] != null) Text(d['city'] as String, style: Theme.of(context).textTheme.bodyMedium),
            if (d['rating'] != null) Text('Valoración: ${d['rating']}', style: Theme.of(context).textTheme.bodyMedium),
            if (d['yearsExp'] != null) Text('Años de experiencia: ${d['yearsExp']}', style: Theme.of(context).textTheme.bodyMedium),
            if (d['bio'] != null && (d['bio'] as String).isNotEmpty) ...[
              const SizedBox(height: 16),
              Text(d['bio'] as String, style: Theme.of(context).textTheme.bodyMedium),
            ],
          ],
        ),
      ),
    );
  }
}
