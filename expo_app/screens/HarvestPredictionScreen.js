import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { predictYield } from '../services/api';

export default function HarvestPredictionScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // 입력 값 상태
  const [inputs, setInputs] = useState({
    month: new Date().getMonth() + 1,
    temperature: '25',
    humidity: '65',
    co2: '700',
    solar_radiation: '1200',
    growth_stage: '생육중기',
    facility_type: '비닐하우스',
  });

  const growthStages = ['생육초기', '생육중기', '생육후기', '수확기'];
  const facilityTypes = ['비닐하우스', '유리온실'];

  const handlePredict = async () => {
    setLoading(true);
    setResult(null);

    try {
      const requestBody = {
        month: inputs.month,
        temperature: parseFloat(inputs.temperature) || 25,
        humidity: parseFloat(inputs.humidity) || 65,
        co2: parseFloat(inputs.co2) || 700,
        solar_radiation: parseFloat(inputs.solar_radiation) || 1200,
        growth_stage: inputs.growth_stage,
        facility_type: inputs.facility_type,
      };

      const data = await predictYield(requestBody);
      setResult(data);
    } catch (error) {
      console.error('예측 오류:', error);
      Alert.alert('오류', '수확량 예측에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const InputCard = ({ label, icon, value, onChangeText, unit, keyboardType = 'numeric' }) => (
    <View style={styles.inputCard}>
      <View style={styles.inputHeader}>
        <Ionicons name={icon} size={20} color={COLORS.primary} />
        <Text style={styles.inputLabel}>{label}</Text>
      </View>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholder="0"
          placeholderTextColor={COLORS.textLight}
        />
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
    </View>
  );

  const SelectCard = ({ label, icon, options, selected, onSelect }) => (
    <View style={styles.inputCard}>
      <View style={styles.inputHeader}>
        <Ionicons name={icon} size={20} color={COLORS.primary} />
        <Text style={styles.inputLabel}>{label}</Text>
      </View>
      <View style={styles.optionsRow}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              selected === option && styles.optionButtonActive,
            ]}
            onPress={() => onSelect(option)}
          >
            <Text
              style={[
                styles.optionText,
                selected === option && styles.optionTextActive,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* 헤더 설명 */}
        <View style={styles.headerCard}>
          <Ionicons name="analytics" size={32} color={COLORS.primary} />
          <Text style={styles.headerTitle}>AI 수확량 예측</Text>
          <Text style={styles.headerDesc}>
            환경 조건을 입력하면 AI가 예상 수확량을 계산합니다
          </Text>
        </View>

        {/* 입력 섹션 */}
        <Text style={styles.sectionTitle}>환경 조건 입력</Text>

        <View style={styles.inputGrid}>
          <InputCard
            label="온도"
            icon="thermometer"
            value={inputs.temperature}
            onChangeText={(v) => setInputs({ ...inputs, temperature: v })}
            unit="°C"
          />
          <InputCard
            label="습도"
            icon="water"
            value={inputs.humidity}
            onChangeText={(v) => setInputs({ ...inputs, humidity: v })}
            unit="%"
          />
          <InputCard
            label="CO₂ 농도"
            icon="cloud"
            value={inputs.co2}
            onChangeText={(v) => setInputs({ ...inputs, co2: v })}
            unit="ppm"
          />
          <InputCard
            label="일사량"
            icon="sunny"
            value={inputs.solar_radiation}
            onChangeText={(v) => setInputs({ ...inputs, solar_radiation: v })}
            unit="J/㎠"
          />
        </View>

        <SelectCard
          label="생육 단계"
          icon="leaf"
          options={growthStages}
          selected={inputs.growth_stage}
          onSelect={(v) => setInputs({ ...inputs, growth_stage: v })}
        />

        <SelectCard
          label="시설 유형"
          icon="home"
          options={facilityTypes}
          selected={inputs.facility_type}
          onSelect={(v) => setInputs({ ...inputs, facility_type: v })}
        />

        {/* 예측 버튼 */}
        <TouchableOpacity
          style={[styles.predictButton, loading && styles.predictButtonDisabled]}
          onPress={handlePredict}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="calculator" size={24} color={COLORS.white} />
              <Text style={styles.predictButtonText}>수확량 예측하기</Text>
            </>
          )}
        </TouchableOpacity>

        {/* 결과 섹션 */}
        {result && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Ionicons name="checkmark-circle" size={28} color={COLORS.success} />
              <Text style={styles.resultTitle}>예측 결과</Text>
            </View>

            <View style={styles.resultMain}>
              <Text style={styles.resultValue}>
                {result.predicted_yield?.toFixed(1) || '0.0'}
              </Text>
              <Text style={styles.resultUnit}>kg/3.3㎡</Text>
            </View>

            {result.confidence_interval && (
              <View style={styles.confidenceRow}>
                <Text style={styles.confidenceLabel}>신뢰 구간</Text>
                <Text style={styles.confidenceValue}>
                  {result.confidence_interval.lower?.toFixed(1)} ~ {result.confidence_interval.upper?.toFixed(1)} kg
                </Text>
              </View>
            )}

            {result.recommendations && result.recommendations.length > 0 && (
              <View style={styles.recommendationsSection}>
                <Text style={styles.recommendationsTitle}>💡 추천사항</Text>
                {result.recommendations.map((rec, index) => (
                  <Text key={index} style={styles.recommendationItem}>
                    • {rec}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  headerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
  },
  headerDesc: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  inputGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  inputCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '47%',
    marginHorizontal: '1.5%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    padding: 0,
  },
  unit: {
    fontSize: 14,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 13,
    color: COLORS.text,
  },
  optionTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  predictButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
  },
  predictButtonDisabled: {
    opacity: 0.6,
  },
  predictButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 8,
  },
  resultMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
  },
  resultValue: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.primary,
  },
  resultUnit: {
    fontSize: 16,
    color: COLORS.textLight,
    marginLeft: 8,
  },
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  confidenceLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  recommendationsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  recommendationsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  recommendationItem: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 22,
    marginBottom: 4,
  },
});