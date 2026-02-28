import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../shared/widgets/svu_app_bar.dart';
import '../../profile/providers/profile_provider.dart';
import '../data/doctor_application_repository.dart';

class DoctorApplicationFormScreen extends ConsumerStatefulWidget {
  const DoctorApplicationFormScreen({super.key});

  @override
  ConsumerState<DoctorApplicationFormScreen> createState() => _DoctorApplicationFormScreenState();
}

class _DoctorApplicationFormScreenState extends ConsumerState<DoctorApplicationFormScreen> {
  final _formKey = GlobalKey<FormState>();

  final _phone = TextEditingController();
  final _nationalId = TextEditingController();
  final _location = TextEditingController();
  final _specialty = TextEditingController(text: 'Urología');
  final _subspecialty = TextEditingController();

  String _doctorType = 'UROLOGIST';
  File? _avatarFile;
  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    _phone.dispose();
    _nationalId.dispose();
    _location.dispose();
    _specialty.dispose();
    _subspecialty.dispose();
    super.dispose();
  }

  Future<void> _pickAvatar() async {
    final picker = ImagePicker();
    final img = await picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (img == null) return;
    setState(() => _avatarFile = File(img.path));
  }

  Future<void> _submit() async {
    setState(() => _error = null);
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      String? avatarUrl;
      if (_avatarFile != null) {
        avatarUrl = await ref.read(doctorApplicationRepositoryProvider).uploadAvatar(_avatarFile!);
      }

      await ref.read(doctorApplicationRepositoryProvider).upsertApplication(
            phone: _phone.text.trim(),
            nationalId: _nationalId.text.trim(),
            location: _location.text.trim(),
            doctorType: _doctorType,
            specialty: _specialty.text.trim(),
            subspecialty: _subspecialty.text.trim(),
            avatarUrl: avatarUrl,
          );

      ref.invalidate(meProvider);
      if (mounted) context.pop();
    } catch (e) {
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
        _saving = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final me = ref.watch(meProvider);
    final existing = me.valueOrNull?['doctorApplication'] as Map<String, dynamic>?;
    final status = existing?['status']?.toString();

    return Scaffold(
      appBar: const SvuAppBar(title: 'Registro profesional', showBack: true),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
        children: [
          if (status != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _StatusBanner(status: status),
            ),
          if (_error != null) ...[
            Text(_error!, style: TextStyle(color: cs.error), textAlign: TextAlign.center),
            const SizedBox(height: 10),
          ],
          Center(
            child: InkWell(
              onTap: _saving ? null : _pickAvatar,
              borderRadius: BorderRadius.circular(999),
              child: CircleAvatar(
                radius: 46,
                backgroundColor: const Color(0xFFF6D36B),
                backgroundImage: _avatarFile != null ? FileImage(_avatarFile!) : null,
                child: _avatarFile == null ? const Icon(Icons.camera_alt_outlined, color: Colors.black) : null,
              ),
            ),
          ),
          const SizedBox(height: 14),
          Form(
            key: _formKey,
            child: Column(
              children: [
                DropdownButtonFormField<String>(
                  value: _doctorType,
                  items: const [
                    DropdownMenuItem(value: 'RESIDENT', child: Text('Residente')),
                    DropdownMenuItem(value: 'UROLOGIST', child: Text('Urólogo')),
                    DropdownMenuItem(value: 'OTHER', child: Text('Otra')),
                  ],
                  onChanged: _saving ? null : (v) => setState(() => _doctorType = v ?? 'UROLOGIST'),
                  decoration: const InputDecoration(
                    prefixIcon: Icon(Icons.badge_outlined),
                    hintText: 'Estatus',
                  ),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _nationalId,
                  decoration: const InputDecoration(prefixIcon: Icon(Icons.credit_card), hintText: 'Cédula'),
                  validator: (v) => v == null || v.trim().isEmpty ? 'Ingresa tu cédula' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _phone,
                  decoration: const InputDecoration(prefixIcon: Icon(Icons.phone_outlined), hintText: 'Teléfono'),
                  validator: (v) => v == null || v.trim().isEmpty ? 'Ingresa tu teléfono' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _location,
                  decoration: const InputDecoration(prefixIcon: Icon(Icons.location_on_outlined), hintText: 'Ubicación'),
                  validator: (v) => v == null || v.trim().isEmpty ? 'Ingresa tu ubicación' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _specialty,
                  decoration: const InputDecoration(prefixIcon: Icon(Icons.local_hospital_outlined), hintText: 'Especialidad'),
                  validator: (v) => v == null || v.trim().length < 2 ? 'Ingresa tu especialidad' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _subspecialty,
                  decoration: const InputDecoration(prefixIcon: Icon(Icons.school_outlined), hintText: 'Subespecialidad (opcional)'),
                ),
                const SizedBox(height: 18),
                FilledButton.icon(
                  onPressed: _saving ? null : _submit,
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF0B6B63),
                    foregroundColor: Colors.white,
                    minimumSize: const Size.fromHeight(48),
                    shape: const StadiumBorder(),
                    textStyle: const TextStyle(fontWeight: FontWeight.w900),
                  ),
                  icon: _saving
                      ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.send),
                  label: const Text('Enviar solicitud'),
                ),
                const SizedBox(height: 10),
                Text(
                  'Tu solicitud quedará en estado PENDIENTE hasta aprobación del administrador.',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(color: cs.onSurface.withValues(alpha: 0.65)),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusBanner extends StatelessWidget {
  const _StatusBanner({required this.status});
  final String status;

  @override
  Widget build(BuildContext context) {
    final (Color bg, String text, IconData icon) = switch (status) {
      'APPROVED' => (Colors.green.shade100, 'Aprobada', Icons.verified),
      'REJECTED' => (Colors.red.shade100, 'Rechazada', Icons.block),
      _ => (Colors.orange.shade100, 'Pendiente', Icons.hourglass_top),
    };
    return Material(
      color: bg,
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Icon(icon),
            const SizedBox(width: 10),
            Expanded(child: Text('Solicitud: $text', style: const TextStyle(fontWeight: FontWeight.w900))),
          ],
        ),
      ),
    );
  }
}

