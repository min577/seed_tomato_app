import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function HarvestPredictionScreen() {
  // 기본 입력
  const [temperature, setTemperature] = useState('25');
  const [humidity, setHumidity] = useState('65');
  const [co2, setCo2] = useState('700');
  
  // 시설 정보
  const [facilityType, setFacilityType] = useState('비닐'); // 비닐 or 유리
  const [area, setArea] = useState('1000'); // 재배 면적 (평)
  
  // 고급 설정
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [lastMonthYield, setLastMonthYield] = useState(''); // 전월 수확량
  
  const [prediction, setPrediction] = useState(null);

  // 수확 기록
  const [records, setRecords] = useState([
    { id: 1, date: '2024-11-20', amount: 142, grade_a: 98, grade_b: 44 },
    { id: 2, date: '2024-11-15', amount: 138, grade_a: 95, grade_b: 43 },
    { id: 3, date: '2024-11-10', amount: 145, grade_a: 102, grade_b: 43 },
  ]);

  const handlePredict = async () => {
    if (!temperature || !humidity || !co2) {
      Alert.alert('알림', '온도, 습도, CO₂를 입력해주세요.');
      return;
    }

    try {
      const requestBody = {
        month: new Date().getMonth() + 1,
        temperature: parseFloat(temperature),
        humidity: parseFloat(humidity),
        co2: parseFloat(co2),
        solar_radiation: 1200,
        growth_stage: '생육중기',
        facility_type: facilityType === '비닐' ? '비닐' : '유리',
      };

      // 재배 면적 추가
      if (area) {
        requestBody.area = parseFloat(area);
      }

      // 전월 수확량 추가 (있으면 정확도 향상)
      if (lastMonthYield) {
        requestBody.yield_last_month = parseFloat(lastMonthYield);
      }

      // n8n 워크플로우 호출
      const response = await fetch('http://seedfarm.co.kr:5678/webhook/yield-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      const data = await response.json();
      console.log('예측 응답:', data);
      
      const result = {
        predicted: data.predicted_yield || 0,
        predicted_total: data.predicted_yield_total || 0,
        confidence: Math.round((data.confidence_interval?.r2_score || 0.9) * 100),
        min: data.confidence_interval?.lower || 0,
        max: data.confidence_interval?.upper || 0,
        model: data.model_used || 'unknown',
        recommendations: data.recommendations || [],
      };
      
      setPrediction(result);
      Alert.alert(
        '예측 완료 ✅',
        `예상 수확량: ${result.predicted.toFixed(1)}kg/3.3㎡\n전체: ${result.predicted_total.toFixed(0)}kg`
      );
    } catch (error) {
      console.error('예측 실패:', error);
      Alert.alert('오류', `수확량 예측에 실패했습니다.\n${error.message}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Ionicons name="stats-chart" size={24} color={COLORS.primary} />
        <Text style={styles.headerTitle}>수확량 예측</Text>
      </View>

      {/* 입력 폼 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>환경 조건 입력</Text>

        {/* 온도 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>🌡️ 온도 (°C)</Text>
          <TextInput
            style={styles.input}
            value={temperature}
            onChangeText={setTemperature}
            keyboardType="numeric"
            placeholder="25"
          />
        </View>

        {/* 습도 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>💧 습도 (%)</Text>
          <TextInput
            style={styles.input}
            value={humidity}
            onChangeText={setHumidity}
            keyboardType="numeric"
            placeholder="65"
          />
        </View>

        {/* CO₂ */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>🌫️ CO₂ (ppm)</Text>
          <TextInput
            style={styles.input}
            value={co2}
            onChangeText={setCo2}
            keyboardType="numeric"
            placeholder="700"
          />
        </View>

        {/* 시설 타입 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>🏠 시설 타입</Text>
          <View style={styles.facilityButtons}>
            <TouchableOpacity
              style={[
                styles.facilityBtn,
                facilityType === '비닐' && styles.facilityBtnActive,
              ]}
              onPress={() => setFacilityType('비닐')}
            >
              <Text
                style={[
                  styles.facilityBtnText,
                  facilityType === '비닐' && styles.facilityBtnTextActive,
                ]}
              >
                비닐하우스
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.facilityBtn,
                facilityType === '유리' && styles.facilityBtnActive,
              ]}
              onPress={() => setFacilityType('유리')}
            >
              <Text
                style={[
                  styles.facilityBtnText,
                  facilityType === '유리' && styles.facilityBtnTextActive,
                ]}
              >
                유리온실
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 고급 설정 토글 */}
        <TouchableOpacity
          style={styles.advancedToggle}
          onPress={() => setShowAdvanced(!showAdvanced)}
        >
          <Text style={styles.advancedToggleText}>
            {showAdvanced ? '▼ 고급 설정 접기' : '▶ 고급 설정 (선택)'}
          </Text>
        </TouchableOpacity>

        {/* 고급 설정 */}
        {showAdvanced && (
          <View style={styles.advancedSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>📏 재배 면적 (평)</Text>
              <TextInput
                style={styles.input}
                value={area}
                onChangeText={setArea}
                keyboardType="numeric"
                placeholder="1000"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>📊 전월 수확량 (kg, 선택)</Text>
              <TextInput
                style={styles.input}
                value={lastMonthYield}
                onChangeText={setLastMonthYield}
                keyboardType="numeric"
                placeholder="입력하면 정확도 향상"
              />
              <Text style={styles.helperText}>
                💡 전월 수확량을 입력하면 예측이 더 정확해집니다
              </Text>
            </View>
          </View>
        )}

        {/* 예측 버튼 */}
        <TouchableOpacity style={styles.predictBtn} onPress={handlePredict}>
          <Ionicons name="analytics" size={20} color="#fff" />
          <Text style={styles.predictBtnText}>수확량 예측하기</Text>
        </TouchableOpacity>
      </View>

      {/* 예측 결과 */}
      {prediction && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 예측 결과</Text>
          
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>예상 수확량 (3.3㎡당)</Text>
            <Text style={styles.resultValue}>
              {prediction.predicted.toFixed(1)} kg
            </Text>
            <Text style={styles.resultRange}>
              범위: {prediction.min.toFixed(1)} ~ {prediction.max.toFixed(1)} kg
            </Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>전체 재배면적 예상</Text>
            <Text style={styles.resultValue}>
              {prediction.predicted_total.toFixed(0)} kg
            </Text>
            <Text style={styles.resultSubtext}>
              ({area || '1000'}평 기준)
            </Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>신뢰도</Text>
            <Text style={styles.resultValue}>{prediction.confidence}%</Text>
            <Text style={styles.resultSubtext}>
              사용 모델: {prediction.model}
            </Text>
          </View>

          {/* 추천 사항 */}
          {prediction.recommendations && prediction.recommendations.length > 0 && (
            <View style={styles.recommendations}>
              <Text style={styles.recommendTitle}>💡 추천 사항</Text>
              {prediction.recommendations.map((rec, index) => (
                <Text key={index} style={styles.recommendItem}>
                  • {rec}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* 수확 통계 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📈 수확 통계</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>425kg</Text>
            <Text style={styles.statLabel}>총 수확량</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>141.7kg</Text>
            <Text style={styles.statLabel}>평균</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>3회</Text>
            <Text style={styles.statLabel}>수확 횟수</Text>
          </View>
        </View>
      </View>

      {/* 수확 기록 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📝 수확 기록</Text>
        {records.map((record) => (
          <View key={record.id} style={styles.recordItem}>
            <View style={styles.recordLeft}>
              <Text style={styles.recordDate}>{record.date}</Text>
              <Text style={styles.recordAmount}>{record.amount}kg</Text>
            </View>
            <View style={styles.recordRight}>
              <Text style={styles.recordGrade}>⭐ 특품: {record.grade_a}kg</Text>
              <Text style={styles.recordGrade}>⭐½ 상품: {record.grade_b}kg</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addRecordBtn}
          onPress={() => Alert.alert('준비 중', '수확 기록 추가 기능 개발 중입니다.')}
        >
          <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.addRecordText}>새 기록 추가</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  facilityButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  facilityBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  facilityBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  facilityBtnText: {
    fontSize: 14,
    color: '#666',
  },
  facilityBtnTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  advancedToggle: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  advancedToggleText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  advancedSection: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  predictBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
  predictBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
  },
  resultRange: {
    fontSize: 12,
    color: '#888',
  },
  resultSubtext: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  recommendations: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#fffbf0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffd700',
  },
  recommendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  recommendItem: {
    fontSize: 13,
    color: '#555',
    marginBottom: 5,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 10,
  },
  recordLeft: {
    flex: 1,
  },
  recordDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  recordAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  recordRight: {
    alignItems: 'flex-end',
  },
  recordGrade: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  addRecordBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    marginTop: 5,
    gap: 5,
  },
  addRecordText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});