// lib/screens/market_screen.dart
// 시장 가격 화면

import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../config/app_theme.dart';
import '../widgets/common_widgets.dart';

class MarketScreen extends StatefulWidget {
  const MarketScreen({super.key});

  @override
  State<MarketScreen> createState() => _MarketScreenState();
}

class _MarketScreenState extends State<MarketScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  Map<String, dynamic>? _marketPrice;
  Map<String, dynamic>? _priceCompare;
  Map<String, dynamic>? _priceHistory;

  bool _isLoadingPrice = true;
  bool _isLoadingCompare = true;
  bool _isLoadingHistory = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadAllData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadAllData() async {
    await Future.wait([
      _loadMarketPrice(),
      _loadPriceCompare(),
      _loadPriceHistory(),
    ]);
  }

  Future<void> _loadMarketPrice() async {
    setState(() => _isLoadingPrice = true);
    final result = await ApiService.getMarketPrice();
    if (mounted) {
      setState(() {
        _marketPrice = result;
        _isLoadingPrice = false;
      });
    }
  }

  Future<void> _loadPriceCompare() async {
    setState(() => _isLoadingCompare = true);
    final result = await ApiService.getPriceCompare();
    if (mounted) {
      setState(() {
        _priceCompare = result;
        _isLoadingCompare = false;
      });
    }
  }

  Future<void> _loadPriceHistory() async {
    setState(() => _isLoadingHistory = true);
    final result = await ApiService.getPriceHistory();
    if (mounted) {
      setState(() {
        _priceHistory = result;
        _isLoadingHistory = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('💰 시장 가격'),
        backgroundColor: AppColors.surface,
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          tabs: const [
            Tab(text: '오늘 시세'),
            Tab(text: '가격 비교'),
            Tab(text: '가격 추이'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildTodayPriceTab(),
          _buildCompareTab(),
          _buildHistoryTab(),
        ],
      ),
    );
  }

  // 오늘 시세 탭
  Widget _buildTodayPriceTab() {
    if (_isLoadingPrice) {
      return const LoadingWidget(message: '시세 불러오는 중...');
    }

    final data = _marketPrice?['data'];
    if (data == null) {
      return const EmptyStateWidget(
        icon: Icons.price_check,
        title: '가격 정보 없음',
        subtitle: '현재 가격 정보를 불러올 수 없습니다',
      );
    }

    final price = data['price'] ?? 0;
    final change = data['change'] ?? 0;
    final changeRate = data['change_rate'] ?? 0.0;
    final direction = data['direction'] ?? 'same';

    return RefreshIndicator(
      onRefresh: _loadMarketPrice,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 오늘 가격 카드
            _buildMainPriceCard(
              price: price,
              change: change,
              changeRate: changeRate,
              direction: direction,
              date: data['date'] ?? '',
            ),
            const SizedBox(height: 24),

            // 과거 가격 비교
            const SectionHeader(title: '가격 변동'),
            const SizedBox(height: 8),
            _buildPriceCompareList(data),
          ],
        ),
      ),
    );
  }

  Widget _buildMainPriceCard({
    required int price,
    required int change,
    required double changeRate,
    required String direction,
    required String date,
  }) {
    final isUp = direction == 'up';
    final isDown = direction == 'down';
    final changeColor = isUp
        ? AppColors.error
        : isDown
            ? AppColors.info
            : AppColors.textSecondary;
    final changeIcon = isUp
        ? Icons.arrow_upward
        : isDown
            ? Icons.arrow_downward
            : Icons.remove;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                '🍅 토마토 도매가',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  date,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${_formatNumber(price)}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 36,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const Padding(
                padding: EdgeInsets.only(bottom: 6, left: 4),
                child: Text(
                  '원/kg',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(changeIcon, size: 16, color: changeColor),
                const SizedBox(width: 4),
                Text(
                  '${change >= 0 ? '+' : ''}$change원',
                  style: TextStyle(
                    color: changeColor,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(width: 4),
                Text(
                  '(${changeRate >= 0 ? '+' : ''}$changeRate%)',
                  style: TextStyle(
                    color: changeColor,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPriceCompareList(Map<String, dynamic> data) {
    final items = [
      {'label': '어제', 'price': data['yesterday_price'] ?? 0},
      {'label': '1주일 전', 'price': data['week_ago_price'] ?? 0},
      {'label': '2주일 전', 'price': data['two_week_ago_price'] ?? 0},
      {'label': '1개월 전', 'price': data['month_ago_price'] ?? 0},
      {'label': '1년 전', 'price': data['year_ago_price'] ?? 0},
    ];

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: items.map((item) {
          final price = item['price'] as int;
          return ListTile(
            title: Text(item['label'] as String),
            trailing: Text(
              '${_formatNumber(price)}원/kg',
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  // 가격 비교 탭
  Widget _buildCompareTab() {
    if (_isLoadingCompare) {
      return const LoadingWidget(message: '가격 비교 중...');
    }

    if (_priceCompare?['success'] != true) {
      return const EmptyStateWidget(
        icon: Icons.compare_arrows,
        title: '비교 정보 없음',
      );
    }

    final wholesale = _priceCompare?['wholesale_summary'] ?? {};
    final online = _priceCompare?['online_summary'] ?? {};
    final comparison = _priceCompare?['comparison'] as List? ?? [];

    return RefreshIndicator(
      onRefresh: _loadPriceCompare,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 도매가 요약
            const SectionHeader(title: '도매가 (가락시장)'),
            const SizedBox(height: 8),
            _buildWholesaleCard(wholesale),
            const SizedBox(height: 24),

            // 온라인가 요약
            const SectionHeader(title: '온라인 최저가'),
            const SizedBox(height: 8),
            _buildOnlinePriceCard(online),
            const SizedBox(height: 24),

            // 마진율 비교
            if (comparison.isNotEmpty) ...[
              const SectionHeader(title: '마진율 비교'),
              const SizedBox(height: 8),
              ...comparison.map((item) => _buildMarginCard(item)),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildWholesaleCard(Map<String, dynamic> wholesale) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          _buildPriceItem('상품', wholesale['high'] ?? 0, AppColors.ready),
          _buildPriceItem('중품', wholesale['mid'] ?? 0, AppColors.notReady),
          _buildPriceItem('방울', wholesale['cherry'] ?? 0, AppColors.truss),
        ],
      ),
    );
  }

  Widget _buildPriceItem(String label, int price, Color color) {
    return Expanded(
      child: Column(
        children: [
          Text(
            label,
            style: TextStyle(
              color: AppColors.textSecondary,
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '${_formatNumber(price)}',
            style: TextStyle(
              color: color,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            '원/kg',
            style: TextStyle(
              color: AppColors.textLight,
              fontSize: 10,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOnlinePriceCard(Map<String, dynamic> online) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('최저가', style: TextStyle(fontSize: 12)),
                  Text(
                    '${_formatNumber(online['lowest_price'] ?? 0)}원/kg',
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text('평균가', style: TextStyle(fontSize: 12)),
                  Text(
                    '${_formatNumber(online['average_price'] ?? 0)}원',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ],
          ),
          if (online['lowest_mall'] != null) ...[
            const Divider(height: 20),
            Text(
              '${online['lowest_mall']} - ${online['lowest_title'] ?? ''}',
              style: TextStyle(
                fontSize: 12,
                color: AppColors.textSecondary,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildMarginCard(Map<String, dynamic> item) {
    final marginRate = item['margin_rate'] ?? 0;
    final isGood = marginRate >= 50;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item['grade'] ?? '',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                Text(
                  '도매 ${_formatNumber(item['wholesale_price'] ?? 0)}원 → 온라인 ${_formatNumber(item['online_lowest'] ?? 0)}원',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: isGood
                  ? AppColors.success.withOpacity(0.1)
                  : AppColors.warning.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              '+$marginRate%',
              style: TextStyle(
                color: isGood ? AppColors.success : AppColors.warning,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // 가격 추이 탭
  Widget _buildHistoryTab() {
    if (_isLoadingHistory) {
      return const LoadingWidget(message: '추이 불러오는 중...');
    }

    final data = _priceHistory?['data'] as List? ?? [];
    final stats = _priceHistory?['stats'] ?? {};

    if (data.isEmpty) {
      return const EmptyStateWidget(
        icon: Icons.show_chart,
        title: '추이 정보 없음',
      );
    }

    return RefreshIndicator(
      onRefresh: _loadPriceHistory,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 통계 요약
            _buildStatsCard(stats),
            const SizedBox(height: 24),

            // 일별 가격 목록
            const SectionHeader(title: '일별 가격'),
            const SizedBox(height: 8),
            ...data.reversed.map((item) => _buildHistoryItem(item)),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsCard(Map<String, dynamic> stats) {
    final high = stats['high'] ?? {};
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Row(
            children: [
              _buildStatItem('최저', high['min'] ?? 0, AppColors.info),
              _buildStatItem('평균', high['avg'] ?? 0, AppColors.textPrimary),
              _buildStatItem('최고', high['max'] ?? 0, AppColors.error),
            ],
          ),
          const Divider(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                (high['change'] ?? 0) >= 0
                    ? Icons.trending_up
                    : Icons.trending_down,
                color: (high['change'] ?? 0) >= 0
                    ? AppColors.error
                    : AppColors.info,
              ),
              const SizedBox(width: 8),
              Text(
                '기간 내 변동: ${(high['change'] ?? 0) >= 0 ? '+' : ''}${high['change'] ?? 0}원',
                style: TextStyle(
                  color: (high['change'] ?? 0) >= 0
                      ? AppColors.error
                      : AppColors.info,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, int price, Color color) {
    return Expanded(
      child: Column(
        children: [
          Text(label, style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
          const SizedBox(height: 4),
          Text(
            '${_formatNumber(price)}',
            style: TextStyle(
              color: color,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const Text('원/kg', style: TextStyle(fontSize: 10)),
        ],
      ),
    );
  }

  Widget _buildHistoryItem(Map<String, dynamic> item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Text(
            item['date'] ?? '',
            style: TextStyle(
              color: AppColors.textSecondary,
              fontSize: 13,
            ),
          ),
          const Spacer(),
          Text(
            '상품 ${_formatNumber(item['high'] ?? 0)}',
            style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13),
          ),
          const SizedBox(width: 16),
          Text(
            '중품 ${_formatNumber(item['mid'] ?? 0)}',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
          ),
        ],
      ),
    );
  }

  String _formatNumber(int number) {
    return number.toString().replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (Match m) => '${m[1]},',
        );
  }
}
