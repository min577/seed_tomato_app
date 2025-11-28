// lib/screens/camera_screen.dart
// 카메라 및 사진 분석 화면

import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../services/api_service.dart';
import '../config/app_theme.dart';
import '../widgets/common_widgets.dart';

class CameraScreen extends StatefulWidget {
  const CameraScreen({super.key});

  @override
  State<CameraScreen> createState() => _CameraScreenState();
}

class _CameraScreenState extends State<CameraScreen>
    with SingleTickerProviderStateMixin {
  final ImagePicker _picker = ImagePicker();
  late TabController _tabController;

  File? _selectedImage;
  Map<String, dynamic>? _analysisResult;
  Map<String, dynamic>? _diagnosisResult;
  bool _isAnalyzing = false;
  bool _isDiagnosing = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? image = await _picker.pickImage(
        source: source,
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );

      if (image != null) {
        setState(() {
          _selectedImage = File(image.path);
          _analysisResult = null;
          _diagnosisResult = null;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('이미지를 불러올 수 없습니다: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _analyzeImage() async {
    if (_selectedImage == null) return;

    setState(() => _isAnalyzing = true);

    try {
      // 이미지를 Base64로 인코딩
      final bytes = await _selectedImage!.readAsBytes();
      final base64Image = base64Encode(bytes);

      final result = await ApiService.analyzeImage(base64Image);

      if (mounted) {
        setState(() {
          _analysisResult = result;
          _isAnalyzing = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isAnalyzing = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('분석 실패: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _diagnoseDisease() async {
    if (_selectedImage == null) return;

    setState(() => _isDiagnosing = true);

    try {
      final bytes = await _selectedImage!.readAsBytes();
      final base64Image = base64Encode(bytes);

      final result = await ApiService.diagnosDisease(base64Image);

      if (mounted) {
        setState(() {
          _diagnosisResult = result;
          _isDiagnosing = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isDiagnosing = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('진단 실패: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('📷 사진 분석'),
        backgroundColor: AppColors.surface,
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          tabs: const [
            Tab(text: '🍅 토마토 분석'),
            Tab(text: '🦠 병해충 진단'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildAnalysisTab(),
          _buildDiagnosisTab(),
        ],
      ),
    );
  }

  Widget _buildAnalysisTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 이미지 영역
          _buildImageArea(),
          const SizedBox(height: 16),

          // 버튼 영역
          _buildImageButtons(),
          const SizedBox(height: 16),

          // 분석 버튼
          if (_selectedImage != null)
            ElevatedButton.icon(
              onPressed: _isAnalyzing ? null : _analyzeImage,
              icon: _isAnalyzing
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(Icons.analytics),
              label: Text(_isAnalyzing ? '분석 중...' : '토마토 분석하기'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          const SizedBox(height: 24),

          // 분석 결과
          if (_analysisResult != null) _buildAnalysisResult(),
        ],
      ),
    );
  }

  Widget _buildDiagnosisTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 이미지 영역
          _buildImageArea(),
          const SizedBox(height: 16),

          // 버튼 영역
          _buildImageButtons(),
          const SizedBox(height: 16),

          // 진단 버튼
          if (_selectedImage != null)
            ElevatedButton.icon(
              onPressed: _isDiagnosing ? null : _diagnoseDisease,
              icon: _isDiagnosing
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(Icons.medical_services),
              label: Text(_isDiagnosing ? '진단 중...' : 'AI 병해충 진단'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.warning,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          const SizedBox(height: 24),

          // 진단 결과
          if (_diagnosisResult != null) _buildDiagnosisResult(),
        ],
      ),
    );
  }

  Widget _buildImageArea() {
    return Container(
      height: 250,
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.grey[300]!,
          width: 2,
        ),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(14),
        child: _selectedImage != null
            ? Image.file(
                _selectedImage!,
                fit: BoxFit.cover,
                width: double.infinity,
              )
            : Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.add_photo_alternate_outlined,
                      size: 64,
                      color: Colors.grey[400],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '사진을 선택해주세요',
                      style: TextStyle(
                        color: Colors.grey[600],
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _buildImageButtons() {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () => _pickImage(ImageSource.camera),
            icon: const Icon(Icons.camera_alt),
            label: const Text('카메라'),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 12),
              side: const BorderSide(color: AppColors.primary),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () => _pickImage(ImageSource.gallery),
            icon: const Icon(Icons.photo_library),
            label: const Text('갤러리'),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 12),
              side: const BorderSide(color: AppColors.primary),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildAnalysisResult() {
    final data = _analysisResult?['data'] ?? _analysisResult;
    final success = _analysisResult?['success'] ?? false;

    if (!success && _analysisResult?['error'] != null) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.error.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          '분석 실패: ${_analysisResult?['error']}',
          style: const TextStyle(color: AppColors.error),
        ),
      );
    }

    final ready = data['Ready'] ?? data['ready'] ?? 0;
    final notReady = data['Not_Ready'] ?? data['not_ready'] ?? 0;
    final disease = data['Disease_Bad'] ?? data['disease'] ?? 0;
    final truss = data['Truss'] ?? data['truss'] ?? 0;
    final ripenessRate = data['ripeness_rate'] ?? 0;
    final diseaseRate = data['disease_rate'] ?? 0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionHeader(title: '분석 결과'),
        const SizedBox(height: 8),

        // 토마토 상태 그리드
        TomatoStatusGrid(
          ready: ready,
          notReady: notReady,
          disease: disease,
          truss: truss,
        ),
        const SizedBox(height: 16),

        // 성숙률 & 병해율
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              RipenessProgressBar(
                percentage: ripenessRate.toDouble(),
                label: '성숙률',
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('병해율'),
                  Text(
                    '$diseaseRate%',
                    style: TextStyle(
                      color: diseaseRate > 5 ? AppColors.error : AppColors.success,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDiagnosisResult() {
    final success = _diagnosisResult?['success'] ?? false;
    final diagnosis = _diagnosisResult?['diagnosis'] ?? '';
    final healthStatus = _diagnosisResult?['healthStatus'] ?? '확인 필요';

    Color statusColor;
    IconData statusIcon;
    switch (healthStatus) {
      case '건강':
        statusColor = AppColors.success;
        statusIcon = Icons.check_circle;
        break;
      case '주의':
        statusColor = AppColors.warning;
        statusIcon = Icons.warning;
        break;
      case '위험':
        statusColor = AppColors.error;
        statusIcon = Icons.dangerous;
        break;
      default:
        statusColor = AppColors.info;
        statusIcon = Icons.help;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionHeader(title: 'AI 진단 결과'),
        const SizedBox(height: 8),

        // 건강 상태 배지
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: statusColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Icon(statusIcon, color: statusColor, size: 24),
              const SizedBox(width: 12),
              Text(
                '건강 상태: $healthStatus',
                style: TextStyle(
                  color: statusColor,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // 진단 내용
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            diagnosis,
            style: const TextStyle(
              fontSize: 14,
              height: 1.6,
              color: AppColors.textPrimary,
            ),
          ),
        ),
      ],
    );
  }
}
