// lib/screens/home_screen.dart
// 홈 화면 - 실시간 모니터링

import 'dart:async';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../config/app_theme.dart';
import '../widgets/common_widgets.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  Map<String, dynamic>? _homeData;
  bool _isLoading = true;
  String? _error;
  Timer? _refreshTimer;

  // 실시간 스트리밍 URL
  final String _streamUrl = 'http://192.168.49.219:8080/stream';

  @override
  void initState() {
    super.initState();
    _loadData();
    // 30초마다 자동 새로고침
    _refreshTimer = Timer.periodic(
      const Duration(seconds: 30),
      (_) => _loadData(),
    );
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadData() async {
    try {
      final data = await ApiService.getHomeData();
      if (mounted) {
        setState(() {
          _homeData = data;
          _isLoading = false;
          _error = data['error'];
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _error = e.toString();
        });
      }
    }
  }

  Future<void> _captureNow() async {
    setState(() => _isLoading = true);

    final result = await ApiService.captureNow();

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            result['success'] == true ? '📸 촬영 완료!' : '촬영 실패: ${result['error']}',
          ),
          backgroundColor:
              result['success'] == true ? AppColors.success : AppColors.error,
        ),
      );

      // 데이터 새로고침
      await _loadData();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadData,
          color: AppColors.primary,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 헤더
                _buildHeader(),
                const SizedBox(height: 20),

                // 실시간 스트리밍
                _buildStreamingSection(),
                const SizedBox(height: 20),

                // 토마토 상태 그리드
                _buildStatusSection(),
                const SizedBox(height: 20),

                // 오늘 요약
                _buildSummarySection(),
                const SizedBox(height: 20),

                // 알림
                _buildAlertsSection(),
                const SizedBox(height: 80), // 하단 여백
              ],
            ),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _captureNow,
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.camera_alt),
        label: const Text('즉시 촬영'),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '🍅 토마토 스마트팜',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              _getLastUpdatedText(),
              style: TextStyle(
                fontSize: 12,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
        IconButton(
          onPressed: _loadData,
          icon: _isLoading
              ? const SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: AppColors.primary,
                  ),
                )
              : const Icon(Icons.refresh, color: AppColors.primary),
        ),
      ],
    );
  }

  Widget _buildStreamingSection() {
    return Container(
      height: 200,
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Stack(
          children: [
            // MJPEG 스트리밍 이미지
            Image.network(
              _streamUrl,
              fit: BoxFit.cover,
              width: double.infinity,
              height: double.infinity,
              loadingBuilder: (context, child, loadingProgress) {
                if (loadingProgress == null) return child;
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const CircularProgressIndicator(
                        color: AppColors.primary,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '스트리밍 연결 중...',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.7),
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                );
              },
              errorBuilder: (context, error, stackTrace) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.videocam_off,
                        size: 48,
                        color: Colors.white.withOpacity(0.5),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '카메라 연결 대기 중',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.7),
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
            // LIVE 배지
            Positioned(
              top: 12,
              left: 12,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.error,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.circle, color: Colors.white, size: 8),
                    SizedBox(width: 4),
                    Text(
                      'LIVE',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusSection() {
    if (_isLoading && _homeData == null) {
      return const Center(child: CircularProgressIndicator());
    }

    final realtime = _homeData?['realtime'] ?? {};
    final ready = realtime['ready'] ?? 0;
    final notReady = realtime['not_ready'] ?? 0;
    final disease = realtime['disease'] ?? 0;
    final truss = realtime['truss'] ?? 0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionHeader(title: '실시간 토마토 현황'),
        const SizedBox(height: 8),
        TomatoStatusGrid(
          ready: ready,
          notReady: notReady,
          disease: disease,
          truss: truss,
        ),
      ],
    );
  }

  Widget _buildSummarySection() {
    final summary = _homeData?['today_summary'] ?? {};
    final harvestRate = (summary['harvest_rate'] ?? 0).toDouble();
    final totalDetected = summary['total_detected'] ?? 0;
    final totalReady = summary['total_ready'] ?? 0;
    final totalDisease = summary['total_disease'] ?? 0;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.summarize, color: AppColors.primary, size: 20),
              SizedBox(width: 8),
              Text(
                '오늘 요약',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          RipenessProgressBar(
            percentage: harvestRate,
            label: '성숙률',
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _buildSummaryItem('감지', totalDetected, Icons.search),
              _buildSummaryItem('수확 가능', totalReady, Icons.check_circle),
              _buildSummaryItem('병해', totalDisease, Icons.warning,
                  isWarning: totalDisease > 0),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryItem(String label, int value, IconData icon,
      {bool isWarning = false}) {
    return Expanded(
      child: Column(
        children: [
          Icon(
            icon,
            color: isWarning ? AppColors.error : AppColors.textSecondary,
            size: 20,
          ),
          const SizedBox(height: 4),
          Text(
            '$value',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: isWarning ? AppColors.error : AppColors.textPrimary,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAlertsSection() {
    final alerts = _homeData?['alerts'] as List? ?? [];

    if (alerts.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionHeader(title: '알림'),
        const SizedBox(height: 8),
        ...alerts.map((alert) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: AlertBanner(
                type: alert['type'] ?? 'info',
                message: alert['message'] ?? '',
                severity: alert['severity'],
              ),
            )),
      ],
    );
  }

  String _getLastUpdatedText() {
    final lastUpdated = _homeData?['last_updated'];
    if (lastUpdated == null) return '업데이트 대기 중...';

    try {
      final dt = DateTime.parse(lastUpdated);
      final now = DateTime.now();
      final diff = now.difference(dt);

      if (diff.inSeconds < 60) {
        return '방금 전 업데이트';
      } else if (diff.inMinutes < 60) {
        return '${diff.inMinutes}분 전 업데이트';
      } else {
        return '${diff.inHours}시간 전 업데이트';
      }
    } catch (e) {
      return '업데이트 대기 중...';
    }
  }
}
