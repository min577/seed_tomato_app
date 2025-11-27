import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function FarmDiaryScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [weather, setWeather] = useState('맑음');
  const [temperature, setTemperature] = useState('');

  const [diaries, setDiaries] = useState([
    {
      id: 1,
      date: '2024-11-25',
      title: '병해충 발견',
      content: '토마토 잎에 흰가루병 초기 증상 발견. 유황 살포 예정.',
      weather: '맑음',
      temperature: '23',
    },
    {
      id: 2,
      date: '2024-11-24',
      title: '수확 완료',
      content: '오늘 142kg 수확. 특품 비율 높음. 품질 우수.',
      weather: '흐림',
      temperature: '21',
    },
    {
      id: 3,
      date: '2024-11-23',
      title: '양액 농도 조정',
      content: 'EC 2.3으로 상향 조정. 생육 상태 양호.',
      weather: '비',
      temperature: '19',
    },
  ]);

  // 새 일지 추가
  const handleAdd = () => {
    setEditMode(false);
    setCurrentEntry(null);
    setTitle('');
    setContent('');
    setWeather('맑음');
    setTemperature('');
    setModalVisible(true);
  };

  // 일지 수정
  const handleEdit = (entry) => {
    setEditMode(true);
    setCurrentEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setWeather(entry.weather);
    setTemperature(entry.temperature);
    setModalVisible(true);
  };

  // 일지 삭제
  const handleDelete = (id) => {
    Alert.alert(
      '일지 삭제',
      '정말 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            setDiaries(diaries.filter(d => d.id !== id));
            Alert.alert('삭제 완료', '일지가 삭제되었습니다.');
          },
        },
      ]
    );
  };

  // 저장
  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('알림', '제목과 내용을 입력해주세요.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    if (editMode && currentEntry) {
      // 수정
      setDiaries(
        diaries.map(d =>
          d.id === currentEntry.id
            ? { ...d, title, content, weather, temperature }
            : d
        )
      );
      Alert.alert('수정 완료', '일지가 수정되었습니다.');
    } else {
      // 추가
      const newEntry = {
        id: Date.now(),
        date: today,
        title,
        content,
        weather,
        temperature,
      };
      setDiaries([newEntry, ...diaries]);
      Alert.alert('저장 완료', '새 일지가 추가되었습니다.');
    }

    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {diaries.map((entry) => (
          <View key={entry.id} style={styles.diaryCard}>
            <View style={styles.diaryHeader}>
              <View>
                <Text style={styles.diaryDate}>{entry.date}</Text>
                <Text style={styles.diaryTitle}>{entry.title}</Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEdit(entry)}
                >
                  <Ionicons name="pencil" size={20} color={COLORS.info} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(entry.id)}
                >
                  <Ionicons name="trash" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.diaryContent}>{entry.content}</Text>

            <View style={styles.diaryFooter}>
              <View style={styles.weatherBadge}>
                <Text style={styles.weatherText}>
                  {entry.weather === '맑음' ? '☀️' : entry.weather === '흐림' ? '☁️' : '🌧️'} {entry.weather}
                </Text>
              </View>
              <Text style={styles.temperatureText}>{entry.temperature}°C</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* 추가 버튼 */}
      <TouchableOpacity style={styles.fab} onPress={handleAdd}>
        <Ionicons name="add" size={32} color={COLORS.white} />
      </TouchableOpacity>

      {/* 모달 */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editMode ? '일지 수정' : '새 일지 작성'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>제목</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="일지 제목"
              />

              <Text style={styles.label}>내용</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={content}
                onChangeText={setContent}
                placeholder="오늘의 작업 내용을 기록하세요"
                multiline
                numberOfLines={6}
              />

              <Text style={styles.label}>날씨</Text>
              <View style={styles.weatherButtons}>
                {['맑음', '흐림', '비'].map((w) => (
                  <TouchableOpacity
                    key={w}
                    style={[
                      styles.weatherButton,
                      weather === w && styles.weatherButtonActive,
                    ]}
                    onPress={() => setWeather(w)}
                  >
                    <Text
                      style={[
                        styles.weatherButtonText,
                        weather === w && styles.weatherButtonTextActive,
                      ]}
                    >
                      {w}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>온도 (°C)</Text>
              <TextInput
                style={styles.input}
                value={temperature}
                onChangeText={setTemperature}
                placeholder="25"
                keyboardType="numeric"
              />
            </ScrollView>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {editMode ? '수정 완료' : '저장하기'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  diaryCard: {
    margin: 16,
    marginBottom: 0,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  diaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  diaryDate: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  diaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  diaryContent: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  diaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  weatherText: {
    fontSize: 12,
    color: COLORS.text,
  },
  temperatureText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalBody: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  weatherButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  weatherButton: {
    flex: 1,
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  weatherButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  weatherButtonText: {
    fontSize: 14,
    color: COLORS.text,
  },
  weatherButtonTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  saveButton: {
    margin: 20,
    padding: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});