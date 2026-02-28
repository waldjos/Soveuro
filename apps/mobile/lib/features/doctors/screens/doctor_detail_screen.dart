import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/doctors_provider.dart';
import '../../../shared/widgets/svu_app_bar.dart';

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
        appBar: const SvuAppBar(title: 'Doctor', showBack: true),
        body: Center(child: Text(_error ?? 'No encontrado')),
      );
    }
    final d = _doctor!;
    final name = d['fullName'] as String? ?? 'Doctor';
    final specialty = d['specialty'] as String? ?? '';
    final city = d['city'] as String?;
    return Scaffold(
      appBar: SvuAppBar(
        showBack: true,
        title: '',
        actions: [
          IconButton(onPressed: () {}, icon: const Icon(Icons.more_horiz_rounded)),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: CircleAvatar(
                radius: 54,
                backgroundColor: Theme.of(context).colorScheme.primary.withValues(alpha: 0.20),
                child: Text(
                  name.isNotEmpty ? name.substring(0, 1).toUpperCase() : '?',
                  style: Theme.of(context).textTheme.headlineLarge?.copyWith(fontWeight: FontWeight.w900),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(name, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900)),
            const SizedBox(height: 4),
            Text(
              [specialty, if (city != null) city].where((s) => s.isNotEmpty).join(' · '),
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.black54),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                _StatPill(label: 'Pacientes', value: (d['patients'] ?? 58).toString()),
                _StatPill(label: 'Reviews', value: (d['reviews'] ?? 100).toString()),
                _StatPill(label: 'Experiencia', value: '${d['yearsExp'] ?? 12} Años'),
              ],
            ),
            const SizedBox(height: 16),
            if (d['bio'] != null && (d['bio'] as String).isNotEmpty) ...[
              Text(
                d['bio'] as String,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.black87),
              ),
              const SizedBox(height: 16),
            ],
            FilledButton(
              onPressed: () {},
              style: FilledButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: Colors.black,
                minimumSize: const Size.fromHeight(52),
                shape: const StadiumBorder(),
                side: BorderSide(color: Colors.black.withValues(alpha: 0.10)),
              ),
              child: const Text('Contáctame', style: TextStyle(fontWeight: FontWeight.w800)),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatPill extends StatelessWidget {
  const _StatPill({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFF6D36B),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(value, style: const TextStyle(fontWeight: FontWeight.w900)),
          Text(label, style: const TextStyle(fontSize: 12)),
        ],
      ),
    );
  }
}
