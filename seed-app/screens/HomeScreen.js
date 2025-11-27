import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { COLORS } from '../constants/colors';
import { getHomeData } from '../services/api';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await getHomeData();
      setData(response);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // 안전한 데이터 접근
  const ready = data?.realtime?.ready ?? 0;
  const notReady = data?.realtime?.not_ready ?? 0;
  const disease = data?.realtime?.disease ?? 0;
  const truss = data?.realtime?.truss ?? 0;
  const total = ready + notReady;
  const harvestRate = total > 0 ? ((ready / total) * 100).toFixed(1) : '0.0';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.greeting}>안녕하세요 👋</Text>
        <Text style={styles.farmName}>민우님</Text>
      </View>

      {/* 오늘의 현황 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>오늘의 현황</Text>
        
        <View style={styles.rateContainer}>
          <Text style={styles.rateLabel}>수확률</Text>
          <Text style={styles.rateValue}>{harvestRate}%</Text>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricBox}>
            <Text style={styles.metricIcon}>✅</Text>
            <Text style={styles.metricValue}>{ready}</Text>
            <Text style={styles.metricLabel}>수확 가능</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricIcon}>⏳</Text>
            <Text style={styles.metricValue}>{notReady}</Text>
            <Text style={styles.metricLabel}>미성숙</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricIcon}>🦠</Text>
            <Text style={styles.metricValue}>{disease}</Text>
            <Text style={styles.metricLabel}>병해</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricIcon}>🌸</Text>
            <Text style={styles.metricValue}>{truss}</Text>
            <Text style={styles.metricLabel}>꽃송이</Text>
          </View>
        </View>
      </View>

      {/* 환경 정보 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>현재 환경</Text>
        <View style={styles.envGrid}>
          <View style={styles.envBox}>
            <Text style={styles.envIcon}>🌡️</Text>
            <Text style={styles.envValue}>25°C</Text>
            <Text style={styles.envLabel}>온도</Text>
          </View>
          <View style={styles.envBox}>
            <Text style={styles.envIcon}>💧</Text>
            <Text style={styles.envValue}>65%</Text>
            <Text style={styles.envLabel}>습도</Text>
          </View>
          <View style={styles.envBox}>
            <Text style={styles.envIcon}>🌫️</Text>
            <Text style={styles.envValue}>700ppm</Text>
            <Text style={styles.envLabel}>CO₂</Text>
          </View>
          <View style={styles.envBox}>
            <Text style={styles.envIcon}>☀️</Text>
            <Text style={styles.envValue}>1200</Text>
            <Text style={styles.envLabel}>일사량</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  farmName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  card: {
    margin: 16,
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  rateContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },
  rateLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  rateValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  metricBox: {
    width: '50%',
    padding: 12,
    alignItems: 'center',
  },
  metricIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  envGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  envBox: {
    width: '50%',
    padding: 12,
    alignItems: 'center',
  },
  envIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  envValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  envLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
});
