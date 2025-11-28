// lib/screens/prediction_screen.dart
// 수확량 예측 화면

import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../config/app_theme.dart';
import '../widgets/common_widgets.dart';

class PredictionScreen extends StatefulWidget {
  const PredictionScreen({super.key});

  @override
  State<PredictionScreen> createState() => _PredictionScreenState();
}

class _PredictionScreenState extends State<PredictionScreen> {
  final _formKey = GlobalKey<FormState>();
  
  // 입력값 컨트롤러
  final _tempController = TextEditingController(text: '25');
  final _humidityController = TextEditingController(text: '70');
  final _co2Controller = TextEditingController(text: '700');
  final _solarController = TextEditingController(text: '1200');
  
  String _selectedGrowthStage = '생육중기(11~12월)';
  String _selectedFacilityType = '비닐하우스';
  
  Map<String, dynamic>? _predictionResult;
  bool _isLoading = false;

  final List<String> _growthStages = [
    '생육초기',
    '생육중기(9~10월)',
    '생육중기(11~12월)',
    '생육중기(1~2월)',
    '생육중기(3~6월)',
    '생육말기(7~8월)',
  ];

  final List<String> _facilityTypes = [
    '비닐하우스',
    '유리온실',
  ];

  @override
  void dispose() {
    _tempController.dispose();
    _humidityController.dispose();
    _co2Controller.dispose();
    _solarController.dispose();
    super.dispose();
  }

  Future<void> _predict() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final result = await ApiService.predictYield(
        temperature: double.parse(_tempController.text),
        humidity: double.parse(_humidityController.text),
        co2: double.tryParse(_co2Controller.text),
        solarRadiation: double.tryParse(_solarController.text),
        growthStage: _selectedGrowthStage,
        facilityType: _selectedFacilityType,
      );

      if (mounted) {
        setState(() {
          _predictionResult = result;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('예측 실패: $e'),
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
        title: const Text('🌱 수확량 예측'),
        backgroundColor: AppColors.surface,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 안내 카드
              _buildInfoCard(),
              const SizedBox(height: 24),

              // 필수 입력
              const SectionHeader(title: '환경 데이터 입력'),
              const SizedBox(height: 8),
              _buildRequiredInputs(),
              const SizedBox(height: 24),

              // 선택 입력
              const SectionHeader(title: '추가 설정 (선택)'),
              const SizedBox(height: 8),
              _buildOptionalInputs(),
              const SizedBox(height: 24),

              // 예측 버튼
              ElevatedButton.icon(
                onPressed: _isLoading ? null : _predict,
                icon: _isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.analytics),
                label: Text(_isLoading ? '예측 중...' : '수확량 예측하기'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
              ),
              const SizedBox(height: 24),

              // 예측 결과
              if (_predictionResult != null) _buildResultSection(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primary.withOpacity(0.1),
            AppColors.primary.withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.primary.withOpacity(0.2),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.lightbulb_outline,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'AI 수확량 예측',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '환경 데이터를 입력하면 ML 모델이 예상 수확량을 계산합니다. (정확도: 90%)',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRequiredInputs() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          // 온도
          TextFormField(
            controller: _tempController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: '온도 (°C) *',
              hintText: '예: 25',
              prefixIcon: Icon(Icons.thermostat, color: AppColors.error),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) return '온도를 입력하세요';
              final temp = double.tryParse(value);
              if (temp == null) return '올바른 숫자를 입력하세요';
              if (temp < 0 || temp > 50) return '0~50 범위로 입력하세요';
              return null;
            },
          ),
          const SizedBox(height: 16),

          // 습도
          TextFormField(
            controller: _humidityController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: '습도 (%) *',
              hintText: '예: 70',
              prefixIcon: Icon(Icons.water_drop, color: AppColors.info),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) return '습도를 입력하세요';
              final humidity = double.tryParse(value);
              if (humidity == null) return '올바른 숫자를 입력하세요';
              if (humidity < 0 || humidity > 100) return '0~100 범위로 입력하세요';
              return null;
            },
          ),
        ],
      ),
    );
  }

  Widget _buildOptionalInputs() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          // CO2
          TextFormField(
            controller: _co2Controller,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'CO₂ (ppm)',
              hintText: '예: 700',
              prefixIcon: Icon(Icons.cloud, color: AppColors.textSecondary),
            ),
          ),
          const SizedBox(height: 16),

          // 일사량
          TextFormField(
            controller: _solarController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: '일사량 (J/㎠/day)',
              hintText: '예: 1200',
              prefixIcon: Icon(Icons.wb_sunny, color: AppColors.warning),
            ),
          ),
          const SizedBox(height: 16),

          // 생육 단계
          DropdownButtonFormField<String>(
            value: _selectedGrowthStage,
            decoration: const InputDecoration(
              labelText: '생육 단계',
              prefixIcon: Icon(Icons.eco, color: AppColors.primary),
            ),
            items: _growthStages.map((stage) {
              return DropdownMenuItem(value: stage, child: Text(stage));
            }).toList(),
            onChanged: (value) {
              if (value != null) setState(() => _selectedGrowthStage = value);
            },
          ),
          const SizedBox(height: 16),

          // 시설 타입
          DropdownButtonFormField<String>(
            value: _selectedFacilityType,
            decoration: const InputDecoration(
              labelText: '시설 타입',
              prefixIcon: Icon(Icons.house, color: AppColors.truss),
            ),
            items: _facilityTypes.map((type) {
              return DropdownMenuItem(value: type, child: Text(type));
            }).toList(),
            onChanged: (value) {
              if (value != null) setState(() => _selectedFacilityType = value);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildResultSection() {
    final success = _predictionResult?['success'] ?? false;
    
    if (!success) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.error.withOpacity(0.1),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(
          '예측 실패: ${_predictionResult?['error'] ?? '알 수 없는 오류'}',
          style: const TextStyle(color: AppColors.error),
        ),
      );
    }

    final predictedYield = _predictionResult?['predicted_yield'] ?? 0.0;
    final confidence = _predictionResult?['confidence_interval'] ?? {};
    final recommendations = _predictionResult?['recommendations'] as List? ?? [];
    final modelUsed = _predictionResult?['model_used'] ?? '';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionHeader(title: '📊 예측 결과'),
        const SizedBox(height: 8),

        // 메인 결과 카드
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: AppColors.primaryGradient,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Column(
            children: [
              const Text(
                '예상 수확량',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    predictedYield.toStringAsFixed(1),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 48,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Padding(
                    padding: EdgeInsets.only(bottom: 8, left: 4),
                    child: Text(
                      'kg/3.3㎡',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 16,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '신뢰구간: ${confidence['lower']?.toStringAsFixed(1) ?? '-'} ~ ${confidence['upper']?.toStringAsFixed(1) ?? '-'} kg',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // 추천 사항
        if (recommendations.isNotEmpty) ...[
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.tips_and_updates, color: AppColors.warning),
                    SizedBox(width: 8),
                    Text(
                      'AI 추천',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                ...recommendations.map((rec) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('• ', style: TextStyle(fontSize: 16)),
                          Expanded(
                            child: Text(
                              rec.toString(),
                              style: TextStyle(
                                color: AppColors.textSecondary,
                                height: 1.4,
                              ),
                            ),
                          ),
                        ],
                      ),
                    )),
              ],
            ),
          ),
        ],

        // 모델 정보
        Padding(
          padding: const EdgeInsets.only(top: 8),
          child: Text(
            '사용 모델: $modelUsed',
            style: TextStyle(
              color: AppColors.textLight,
              fontSize: 11,
            ),
            textAlign: TextAlign.center,
          ),
        ),
      ],
    );
  }
}
