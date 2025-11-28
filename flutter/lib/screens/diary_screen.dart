// lib/screens/diary_screen.dart
// 농장 일지 화면

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../config/app_theme.dart';
import '../widgets/common_widgets.dart';

class DiaryScreen extends StatefulWidget {
  const DiaryScreen({super.key});

  @override
  State<DiaryScreen> createState() => _DiaryScreenState();
}

class _DiaryScreenState extends State<DiaryScreen> {
  List<Map<String, dynamic>> _entries = [];
  bool _isLoading = true;
  String? _error;
  int _selectedDays = 7;

  @override
  void initState() {
    super.initState();
    _loadDiary();
  }

  Future<void> _loadDiary() async {
    setState(() => _isLoading = true);

    try {
      final result = await ApiService.getDiaryList(days: _selectedDays);
      if (mounted) {
        setState(() {
          _entries = List<Map<String, dynamic>>.from(result['entries'] ?? []);
          _isLoading = false;
          _error = result['error'];
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

  Future<void> _showAddDiaryDialog() async {
    final harvestController = TextEditingController();
    final memoController = TextEditingController();

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
            left: 20,
            right: 20,
            top: 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    '📝 오늘의 기록',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // 수확량 입력
              TextField(
                controller: harvestController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: InputDecoration(
                  labelText: '수확량 (kg)',
                  hintText: '예: 15.5',
                  prefixIcon: const Icon(Icons.scale, color: AppColors.primary),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // 메모 입력
              TextField(
                controller: memoController,
                maxLines: 3,
                decoration: InputDecoration(
                  labelText: '메모',
                  hintText: '오늘의 관찰 내용, 작업 내용 등',
                  prefixIcon: const Icon(Icons.note, color: AppColors.primary),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // 저장 버튼
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () async {
                    final harvest = double.tryParse(harvestController.text);
                    final memo = memoController.text.trim();

                    if (harvest == null && memo.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('수확량 또는 메모를 입력해주세요')),
                      );
                      return;
                    }

                    final result = await ApiService.saveDiary(
                      date: DateFormat('yyyy-MM-dd').format(DateTime.now()),
                      harvestKg: harvest,
                      memo: memo.isNotEmpty ? memo : null,
                    );

                    if (mounted) {
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            result['success'] == true
                                ? '✅ 저장되었습니다!'
                                : '저장 실패',
                          ),
                          backgroundColor: result['success'] == true
                              ? AppColors.success
                              : AppColors.error,
                        ),
                      );
                      _loadDiary();
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: const Text('저장하기'),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('📝 농장 일지'),
        backgroundColor: AppColors.surface,
        elevation: 0,
        actions: [
          // 기간 선택
          PopupMenuButton<int>(
            onSelected: (days) {
              setState(() => _selectedDays = days);
              _loadDiary();
            },
            itemBuilder: (context) => [
              const PopupMenuItem(value: 7, child: Text('최근 7일')),
              const PopupMenuItem(value: 14, child: Text('최근 14일')),
              const PopupMenuItem(value: 30, child: Text('최근 30일')),
            ],
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Text(
                    '최근 $_selectedDays일',
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const Icon(Icons.arrow_drop_down, color: AppColors.primary),
                ],
              ),
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadDiary,
        child: _buildBody(),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddDiaryDialog,
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add),
        label: const Text('기록 추가'),
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const LoadingWidget(message: '일지 불러오는 중...');
    }

    if (_error != null && _entries.isEmpty) {
      return EmptyStateWidget(
        icon: Icons.error_outline,
        title: '데이터를 불러올 수 없습니다',
        subtitle: _error,
        action: ElevatedButton(
          onPressed: _loadDiary,
          child: const Text('다시 시도'),
        ),
      );
    }

    if (_entries.isEmpty) {
      return EmptyStateWidget(
        icon: Icons.note_alt_outlined,
        title: '기록이 없습니다',
        subtitle: '첫 번째 농장 일지를 작성해보세요!',
        action: ElevatedButton.icon(
          onPressed: _showAddDiaryDialog,
          icon: const Icon(Icons.add),
          label: const Text('기록 추가'),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _entries.length,
      itemBuilder: (context, index) {
        return _buildDiaryCard(_entries[index]);
      },
    );
  }

  Widget _buildDiaryCard(Map<String, dynamic> entry) {
    final date = entry['date'] ?? '';
    final ready = entry['ready'] ?? 0;
    final notReady = entry['not_ready'] ?? 0;
    final disease = entry['disease'] ?? 0;
    final truss = entry['truss'] ?? 0;
    final memo = entry['memo'] ?? '';

    // 날짜 포맷팅
    String formattedDate = date;
    try {
      final dt = DateTime.parse(date);
      formattedDate = DateFormat('M월 d일 (E)', 'ko_KR').format(dt);
    } catch (e) {
      // 파싱 실패 시 원본 사용
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 날짜 헤더
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  formattedDate,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '총 ${ready + notReady + disease}개',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.primary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // 토마토 현황
            Row(
              children: [
                _buildMiniStat('✅', ready, '수확'),
                _buildMiniStat('⏳', notReady, '미성숙'),
                _buildMiniStat('🦠', disease, '병해'),
                _buildMiniStat('🌸', truss, '화방'),
              ],
            ),

            // 메모
            if (memo.isNotEmpty) ...[
              const Divider(height: 24),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(
                    Icons.note,
                    size: 16,
                    color: AppColors.textLight,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      memo,
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.textSecondary,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildMiniStat(String emoji, int value, String label) {
    return Expanded(
      child: Column(
        children: [
          Text(emoji, style: const TextStyle(fontSize: 18)),
          const SizedBox(height: 4),
          Text(
            '$value',
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              color: AppColors.textLight,
            ),
          ),
        ],
      ),
    );
  }
}
