import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function AppSettingsScreen({ navigation }) {
  const [darkMode, setDarkMode] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);

  const SettingButton = ({ icon, title, subtitle, onPress, showArrow = true, color = COLORS.primary }) => (
    <TouchableOpacity style={styles.settingButton} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
      )}
    </TouchableOpacity>
  );

  const SettingToggle = ({ icon, title, subtitle, value, onToggle, color = COLORS.primary }) => (
    <View style={styles.settingButton}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
        thumbColor={value ? COLORS.primary : COLORS.white}
      />
    </View>
  );

  const handleLanguage = () => {
    Alert.alert('언어 설정', '현재 한국어만 지원됩니다.');
  };

  const handleCache = () => {
    Alert.alert(
      '캐시 삭제',
      '앱 캐시를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', onPress: () => Alert.alert('✅', '캐시가 삭제되었습니다.') }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '로그아웃', onPress: () => console.log('Logout'), style: 'destructive' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>앱 설정</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>화면 설정</Text>
        <SettingToggle
          icon="moon"
          title="다크 모드"
          subtitle="어두운 테마 사용"
          value={darkMode}
          onToggle={setDarkMode}
          color="#9C27B0"
        />
        <SettingButton
          icon="language"
          title="언어"
          subtitle="한국어"
          onPress={handleLanguage}
          color="#2196F3"
        />

        <Text style={styles.sectionTitle}>데이터 설정</Text>
        <SettingToggle
          icon="cloud-download"
          title="자동 업데이트"
          subtitle="WiFi 연결 시 자동 업데이트"
          value={autoUpdate}
          onToggle={setAutoUpdate}
          color="#4CAF50"
        />
        <SettingButton
          icon="trash"
          title="캐시 삭제"
          subtitle="임시 파일 삭제"
          onPress={handleCache}
          color="#FF9800"
        />

        <Text style={styles.sectionTitle}>계정</Text>
        <SettingButton
          icon="person-circle"
          title="계정 정보"
          subtitle="프로필 및 비밀번호 변경"
          onPress={() => {}}
          color={COLORS.primary}
        />
        <SettingButton
          icon="log-out"
          title="로그아웃"
          onPress={handleLogout}
          color="#F44336"
        />

        <Text style={styles.sectionTitle}>정보</Text>
        <SettingButton
          icon="document-text"
          title="이용약관"
          onPress={() => {}}
          color="#607D8B"
        />
        <SettingButton
          icon="shield-checkmark"
          title="개인정보 처리방침"
          onPress={() => {}}
          color="#607D8B"
        />
        <SettingButton
          icon="help-circle"
          title="고객 지원"
          subtitle="문의 및 피드백"
          onPress={() => {}}
          color="#607D8B"
        />

        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>버전 1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 Seed Farm. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textLight,
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 20,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  settingSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  versionInfo: {
    alignItems: 'center',
    padding: 32,
    gap: 8,
  },
  versionText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  copyrightText: {
    fontSize: 11,
    color: COLORS.textLight,
  },
});