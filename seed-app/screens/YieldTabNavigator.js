/**
 * 수확량 탭 네비게이터 (패키지 없이 직접 구현)
 * - 웹/네이티브 모두 호환
 * - 수확량 예측 탭
 * - 시장 가격 탭
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import HarvestPredictionScreen from './HarvestPredictionScreen';
import MarketPriceScreen from './MarketPriceScreen';

const YieldTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('prediction'); // 'prediction' | 'market'

  const tabs = [
    { key: 'prediction', label: '📊 수확량 예측' },
    { key: 'market', label: '🏪 시장 가격' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>수확량 예측</Text>
      </View>

      {/* 탭 바 */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabItem,
              activeTab === tab.key && styles.tabItemActive,
            ]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 탭 인디케이터 */}
      <View style={styles.indicatorContainer}>
        <View 
          style={[
            styles.indicator, 
            { left: activeTab === 'prediction' ? '0%' : '50%' }
          ]} 
        />
      </View>

      {/* 탭 컨텐츠 */}
      <View style={styles.content}>
        {activeTab === 'prediction' ? (
          <HarvestPredictionScreen />
        ) : (
          <MarketPriceScreen />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabItemActive: {
    // 활성 탭 스타일 (필요시 추가)
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabLabelActive: {
    color: COLORS.primary,
  },
  indicatorContainer: {
    height: 3,
    backgroundColor: '#e5e7eb',
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    width: '50%',
    height: 3,
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default YieldTabNavigator;