import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// ✅ 중앙 집중 import
import { COLORS } from '../constants/colors';
import {
  RASPBERRY_URL,
  SNAPSHOT_URL,
  getRealtimeData,
  captureNow,
  getRaspberryStatus,
  startRaspberryStream,
  runDiseaseAnalysis,
} from '../services/api';

const { width } = Dimensions.get('window');

export default function MonitorScreen() {
  const [activeTab, setActiveTab] = useState('live'); // 'live' or 'analyze'

  return (
    <View style={styles.container}>
      {/* 상단 탭 바 */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'live' && styles.tabActive]}
          onPress={() => setActiveTab('live')}
        >
          <Ionicons 
            name="videocam" 
            size={20} 
            color={activeTab === 'live' ? COLORS.primary : COLORS.textLight} 
          />
          <Text style={[styles.tabText, activeTab === 'live' && styles.tabTextActive]}>
            상시 모니터링
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analyze' && styles.tabActive]}
          onPress={() => setActiveTab('analyze')}
        >
          <Ionicons 
            name="scan" 
            size={20} 
            color={activeTab === 'analyze' ? COLORS.primary : COLORS.textLight} 
          />
          <Text style={[styles.tabText, activeTab === 'analyze' && styles.tabTextActive]}>
            사진 분석
          </Text>
        </TouchableOpacity>
      </View>

      {/* 탭 콘텐츠 */}
      {activeTab === 'live' ? <LiveMonitorTab /> : <AnalyzeTab />}
    </View>
  );
}

// ========================================
// 탭 1: 상시 모니터링 (라즈베리파이)
// ========================================
function LiveMonitorTab() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [lastCapture, setLastCapture] = useState(null);
  const [captureResult, setCaptureResult] = useState(null);
  const [realtimeData, setRealtimeData] = useState(null);
  const [streamError, setStreamError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // 분석 로그 관련
  const [analysisLogs, setAnalysisLogs] = useState([]);
  const [autoAnalysisInterval, setAutoAnalysisInterval] = useState(30);
  const [isAutoAnalyzing, setIsAutoAnalyzing] = useState(false);

  // 로그 추가 함수
  const addLog = (type, message, data = null) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    
    const newLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      time: timeStr,
      type,
      message,
      data,
    };
    
    setAnalysisLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  // ✅ API 함수 사용
  const fetchRealtimeData = async () => {
    try {
      const data = await getRealtimeData();
      setRealtimeData(data);
      return data;
    } catch (error) {
      console.error('실시간 데이터 조회 실패:', error);
      return null;
    }
  };

  // ✅ API 함수 사용
  const checkServerStatus = async () => {
    try {
      const data = await getRaspberryStatus();
      console.log('라즈베리파이 서버 상태:', data);
      
      if (data.streaming) {
        setIsConnected(true);
        setStreamError(null);
        return true;
      } else {
        await startRaspberryStream();
        setIsConnected(true);
        return true;
      }
    } catch (error) {
      console.log('서버 연결 실패:', error.message);
      setStreamError('라즈베리파이 연결 안됨');
      setIsConnected(false);
      return false;
    }
  };

  // ✅ API 함수 사용
  const runYoloAnalysis = async (isAuto = false) => {
    const prefix = isAuto ? '[자동]' : '[수동]';
    
    try {
      addLog('info', `${prefix} YOLO 분석 시작...`);
      
      // n8n을 통해 라즈베리파이 촬영 + YOLO 분석 요청
      await captureNow();
      
      // 분석 완료까지 대기
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 최신 데이터 조회
      const data = await getRealtimeData();
      
      if (data && (data.Ready !== undefined || data.ready !== undefined)) {
        const result = {
          Ready: data.Ready ?? data.ready ?? 0,
          Not_Ready: data.Not_Ready ?? data.not_ready ?? 0,
          Disease_Bad: data.Disease_Bad ?? data.disease ?? 0,
          Truss: data.Truss ?? data.truss ?? 0,
        };
        
        setCaptureResult(result);
        setLastCapture(new Date());
        
        const total = result.Ready + result.Not_Ready;
        const ripenessRate = total > 0 ? Math.round((result.Ready / total) * 100) : 0;
        
        addLog('analysis', `${prefix} 분석 완료`, {
          ready: result.Ready,
          notReady: result.Not_Ready,
          disease: result.Disease_Bad,
          truss: result.Truss,
          ripenessRate,
        });
        
        if (result.Disease_Bad > 0) {
          const diseaseRate = total > 0 ? Math.round((result.Disease_Bad / (total + result.Disease_Bad)) * 100) : 0;
          if (diseaseRate > 10) {
            addLog('error', `⚠️ 병해 경고! ${result.Disease_Bad}개 감지 (${diseaseRate}%)`);
          }
        }
        
        return result;
      } else {
        throw new Error('데이터 조회 실패');
      }
    } catch (error) {
      console.error('YOLO 분석 오류:', error);
      addLog('error', `${prefix} 분석 실패: ${error.message}`);
      return null;
    }
  };

  // 초기 로드
  useEffect(() => {
    fetchRealtimeData();
    checkServerStatus();
    addLog('info', '모니터링 화면 로드됨');
  }, []);

  // 스냅샷 폴링
  useEffect(() => {
    let intervalId;
    if (isMonitoring) {
      intervalId = setInterval(() => {
        setImageUrl(`${SNAPSHOT_URL}?t=${Date.now()}`);
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isMonitoring]);

  // 자동 YOLO 분석
  useEffect(() => {
    let analysisIntervalId;
    if (isAutoAnalyzing && isMonitoring) {
      addLog('info', `자동 분석 시작 (${autoAnalysisInterval}초 간격)`);
      runYoloAnalysis(true);
      
      analysisIntervalId = setInterval(() => {
        runYoloAnalysis(true);
      }, autoAnalysisInterval * 1000);
    }
    return () => {
      if (analysisIntervalId) clearInterval(analysisIntervalId);
    };
  }, [isAutoAnalyzing, isMonitoring, autoAnalysisInterval]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await checkServerStatus();
    setImageUrl(`${SNAPSHOT_URL}?t=${Date.now()}`);
    await fetchRealtimeData();
    addLog('info', '새로고침 완료');
    setIsRefreshing(false);
  };

  const handleStartMonitoring = async () => {
    console.log('📹 모니터링 시작...');
    const connected = await checkServerStatus();
    if (connected) {
      setIsMonitoring(true);
      setImageUrl(`${SNAPSHOT_URL}?t=${Date.now()}`);
      addLog('success', '✅ 실시간 모니터링 시작');
    } else {
      addLog('error', '❌ 라즈베리파이 연결 실패');
      Alert.alert('❌ 연결 실패', '라즈베리파이에 연결할 수 없습니다.\n\nIP: 192.168.49.219:8080');
    }
  };

  const handleStopMonitoring = () => {
    console.log('⏹️ 모니터링 중지');
    setIsMonitoring(false);
    setIsAutoAnalyzing(false);
    addLog('info', '⏹️ 모니터링 중지');
  };

  const handleCapture = async () => {
    setIsCapturing(true);
    await runYoloAnalysis(false);
    setIsCapturing(false);
  };

  const toggleAutoAnalysis = () => {
    if (!isMonitoring) {
      Alert.alert('알림', '먼저 모니터링을 시작해주세요.');
      return;
    }
    setIsAutoAnalyzing(!isAutoAnalyzing);
    if (!isAutoAnalyzing) {
      addLog('success', `🔄 자동 분석 ON (${autoAnalysisInterval}초 간격)`);
    } else {
      addLog('info', '🔄 자동 분석 OFF');
    }
  };

  const clearLogs = () => {
    setAnalysisLogs([]);
    addLog('info', '로그 초기화됨');
  };

  const formatLastCapture = () => {
    if (!lastCapture) return '-';
    return lastCapture.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const calculateRipenessRate = () => {
    const data = captureResult || realtimeData;
    if (!data) return 0;
    const ready = data.Ready ?? data.ready ?? 0;
    const notReady = data.Not_Ready ?? data.not_ready ?? 0;
    const total = ready + notReady;
    return total > 0 ? Math.round((ready / total) * 100) : 0;
  };

  const getLogStyle = (type) => {
    switch (type) {
      case 'success': return { icon: 'checkmark-circle', color: '#16a34a' };
      case 'error': return { icon: 'alert-circle', color: '#dc2626' };
      case 'analysis': return { icon: 'analytics', color: '#2563eb' };
      default: return { icon: 'information-circle', color: '#64748b' };
    }
  };

  return (
    <ScrollView 
      style={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      {/* 연결 상태 표시 */}
      {streamError && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning" size={20} color="#dc2626" />
          <Text style={styles.errorBannerText}>{streamError}</Text>
          <TouchableOpacity onPress={handleRefresh}>
            <Text style={styles.retryText}>재시도</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 스트리밍 화면 */}
      <View style={styles.streamContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.streamImage}
            onError={() => {
              console.log('스트리밍 이미지 로드 실패');
              setStreamError('이미지 로드 실패');
            }}
            onLoad={() => setStreamError(null)}
          />
        ) : (
          <View style={styles.noStreamPlaceholder}>
            <Ionicons name="videocam-off" size={64} color="#ccc" />
            <Text style={styles.noStreamText}>카메라 연결 대기중...</Text>
            <Text style={styles.noStreamSubText}>아래 버튼을 눌러 모니터링을 시작하세요</Text>
          </View>
        )}
        <View style={styles.liveIndicator}>
          <View style={[styles.liveDot, isMonitoring && styles.liveDotActive]} />
          <Text style={styles.liveText}>{isMonitoring ? 'LIVE' : 'STANDBY'}</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* YOLO 분석 결과 */}
      {(captureResult || realtimeData) && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.cardTitle}>🤖 YOLO 분석 결과</Text>
            {lastCapture && (
              <Text style={styles.resultTime}>{formatLastCapture()}</Text>
            )}
          </View>

          <View style={styles.rateContainer}>
            <Text style={styles.rateLabel}>수확률</Text>
            <Text style={styles.rateValue}>{calculateRipenessRate()}%</Text>
          </View>

          <View style={styles.resultGrid}>
            <View style={styles.resultItem}>
              <Text style={styles.resultEmoji}>🍅</Text>
              <Text style={styles.resultValue}>
                {(captureResult || realtimeData)?.Ready ?? (captureResult || realtimeData)?.ready ?? 0}
              </Text>
              <Text style={styles.resultLabel}>수확 가능</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultEmoji}>⏳</Text>
              <Text style={styles.resultValue}>
                {(captureResult || realtimeData)?.Not_Ready ?? (captureResult || realtimeData)?.not_ready ?? 0}
              </Text>
              <Text style={styles.resultLabel}>미성숙</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultEmoji}>🦠</Text>
              <Text style={styles.resultValue}>
                {(captureResult || realtimeData)?.Disease_Bad ?? (captureResult || realtimeData)?.disease ?? 0}
              </Text>
              <Text style={styles.resultLabel}>병해</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultEmoji}>🌸</Text>
              <Text style={styles.resultValue}>
                {(captureResult || realtimeData)?.Truss ?? (captureResult || realtimeData)?.truss ?? 0}
              </Text>
              <Text style={styles.resultLabel}>꽃송이</Text>
            </View>
          </View>
        </View>
      )}

      {/* 카메라 상태 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📷 카메라 상태</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>자동 모니터링:</Text>
          <View style={[styles.statusBadge, isMonitoring ? styles.statusBadgeActive : styles.statusBadgeInactive]}>
            <Text style={[styles.statusBadgeText, isMonitoring && styles.statusBadgeTextActive]}>
              {isMonitoring ? '● 실행 중' : '○ 대기 중'}
            </Text>
          </View>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>촬영 간격:</Text>
          <Text style={styles.statusValue}>10분</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>분석 방식:</Text>
          <Text style={styles.statusValue}>YOLO v8</Text>
        </View>
      </View>

      {/* 제어 버튼 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎮 제어</Text>

        <TouchableOpacity
          style={[styles.primaryButton, isCapturing && styles.buttonDisabled]}
          onPress={handleCapture}
          disabled={isCapturing}
        >
          {isCapturing ? (
            <>
              <ActivityIndicator size="small" color={COLORS.white} />
              <Text style={styles.buttonText}>YOLO 분석 중...</Text>
            </>
          ) : (
            <>
              <Ionicons name="camera" size={24} color={COLORS.white} />
              <Text style={styles.buttonText}>지금 촬영 + YOLO 분석</Text>
            </>
          )}
        </TouchableOpacity>

        {!isMonitoring ? (
          <TouchableOpacity style={styles.secondaryButton} onPress={handleStartMonitoring}>
            <Ionicons name="play" size={24} color={COLORS.primary} />
            <Text style={styles.secondaryButtonText}>실시간 모니터링 시작</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.dangerButton} onPress={handleStopMonitoring}>
            <Ionicons name="stop" size={24} color={COLORS.white} />
            <Text style={styles.buttonText}>모니터링 중지</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 자동 분석 설정 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔄 자동 분석 설정</Text>
        
        <View style={styles.intervalRow}>
          <Text style={styles.intervalLabel}>분석 간격:</Text>
          <View style={styles.intervalButtons}>
            {[10, 30, 60, 120].map((sec) => (
              <TouchableOpacity
                key={sec}
                style={[
                  styles.intervalButton,
                  autoAnalysisInterval === sec && styles.intervalButtonActive,
                ]}
                onPress={() => setAutoAnalysisInterval(sec)}
              >
                <Text style={[
                  styles.intervalButtonText,
                  autoAnalysisInterval === sec && styles.intervalButtonTextActive,
                ]}>
                  {sec < 60 ? `${sec}초` : `${sec/60}분`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.autoAnalysisButton,
            isAutoAnalyzing && styles.autoAnalysisButtonActive,
            !isMonitoring && styles.buttonDisabled,
          ]}
          onPress={toggleAutoAnalysis}
          disabled={!isMonitoring}
        >
          <Ionicons 
            name={isAutoAnalyzing ? "pause-circle" : "play-circle"} 
            size={24} 
            color={isAutoAnalyzing ? COLORS.white : (!isMonitoring ? '#94a3b8' : COLORS.primary)} 
          />
          <Text style={[
            styles.autoAnalysisButtonText,
            isAutoAnalyzing && styles.autoAnalysisButtonTextActive,
            !isMonitoring && { color: '#94a3b8' },
          ]}>
            {isAutoAnalyzing ? `자동 분석 중 (${autoAnalysisInterval}초)` : '자동 분석 시작'}
          </Text>
        </TouchableOpacity>

        {!isMonitoring && (
          <Text style={styles.hintText}>* 먼저 모니터링을 시작해주세요</Text>
        )}
      </View>

      {/* 분석 로그 */}
      <View style={styles.card}>
        <View style={styles.logHeader}>
          <Text style={styles.cardTitle}>📋 분석 로그</Text>
          <TouchableOpacity onPress={clearLogs} style={styles.clearLogButton}>
            <Ionicons name="trash-outline" size={18} color={COLORS.textLight} />
            <Text style={styles.clearLogText}>지우기</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.logContainer}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
        >
          {analysisLogs.length === 0 ? (
            <Text style={styles.emptyLogText}>분석 로그가 없습니다.</Text>
          ) : (
            analysisLogs.map((log) => {
              const logStyle = getLogStyle(log.type);
              return (
                <View key={log.id} style={styles.logItem}>
                  <View style={styles.logIconContainer}>
                    <Ionicons name={logStyle.icon} size={16} color={logStyle.color} />
                  </View>
                  <View style={styles.logContent}>
                    <View style={styles.logTopRow}>
                      <Text style={[styles.logMessage, { color: logStyle.color }]}>
                        {log.message}
                      </Text>
                      <Text style={styles.logTime}>{log.time}</Text>
                    </View>
                    {log.data && log.type === 'analysis' && (
                      <View style={styles.logDataRow}>
                        <Text style={styles.logDataText}>
                          ✅ 완숙 {log.data.ready}개 | ⏳ 미성숙 {log.data.notReady}개 | 
                          🦠 병해 {log.data.disease}개 | 🌸 화방 {log.data.truss}개
                        </Text>
                        <Text style={styles.logRipeness}>
                          성숙도: {log.data.ripenessRate}%
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>

      {/* 안내 */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={20} color={COLORS.info} />
        <Text style={styles.infoText}>
          라즈베리파이 카메라로 온실을 모니터링합니다.{'\n'}
          자동 분석을 켜면 설정된 간격마다 YOLO 분석이 실행됩니다.
        </Text>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

// ========================================
// 탭 2: 사진 분석 (Gemini AI 병해충 진단)
// ========================================
function AnalyzeTab() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageAsset, setSelectedImageAsset] = useState(null);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [analysisTime, setAnalysisTime] = useState(null);

  const takePhoto = async () => {
    console.log('📷 takePhoto 호출됨');
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      console.log('✅ 이미지 촬영됨');
      setSelectedImage(result.assets[0].uri);
      setSelectedImageAsset(result.assets[0]);
      setDiagnosisResult(null);
    }
  };

  const pickImage = async () => {
    console.log('🖼️ pickImage 호출됨');
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      console.log('✅ 이미지 선택됨');
      setSelectedImage(result.assets[0].uri);
      setSelectedImageAsset(result.assets[0]);
      setDiagnosisResult(null);
    }
  };

  // ✅ API 함수 사용
  const handleDiseaseAnalysis = async () => {
    if (!selectedImageAsset) {
      Alert.alert('📷 이미지 필요', '먼저 카메라로 촬영하거나 갤러리에서 이미지를 선택해주세요.');
      return;
    }

    setIsAnalyzing(true);
    setDiagnosisResult(null);

    try {
      console.log('🔬 병해충 진단 시작...');

      let base64Image = selectedImageAsset.base64;
      
      if (!base64Image) {
        console.log('📸 Base64 변환 중...');
        const imageResponse = await fetch(selectedImageAsset.uri);
        const blob = await imageResponse.blob();
        base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result;
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      console.log('📤 Base64 길이:', base64Image?.length);
      
      // ✅ API 함수 사용
      const result = await runDiseaseAnalysis(base64Image, 'image/jpeg');

      console.log('📊 진단 결과:', result);

      if (result.success && result.diagnosis) {
        setDiagnosisResult({
          analysis: result.diagnosis,
          healthStatus: result.healthStatus,
          timestamp: result.timestamp,
        });
        setAnalysisTime(new Date());
        console.log('✅ 병해충 진단 완료!');
      } else {
        throw new Error(result.error || '진단 결과가 없습니다.');
      }

    } catch (error) {
      console.error('🔴 병해충 진단 오류:', error);
      Alert.alert('❌ 분석 오류', `병해충 진단에 실패했습니다.\n\n${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatAnalysisTime = () => {
    if (!analysisTime) return '';
    return analysisTime.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getHealthStatus = () => {
    if (!diagnosisResult) return null;
    
    const status = diagnosisResult.healthStatus;
    
    if (status === '위험') {
      return { status: '위험', color: '#dc2626', icon: 'alert-circle' };
    } else if (status === '주의') {
      return { status: '주의', color: '#f59e0b', icon: 'warning' };
    } else if (status === '건강') {
      return { status: '건강', color: '#16a34a', icon: 'checkmark-circle' };
    } else {
      const text = diagnosisResult.analysis?.toLowerCase() || '';
      if (text.includes('위험') || text.includes('심각')) {
        return { status: '위험', color: '#dc2626', icon: 'alert-circle' };
      } else if (text.includes('주의') || text.includes('관찰')) {
        return { status: '주의', color: '#f59e0b', icon: 'warning' };
      } else {
        return { status: '건강', color: '#16a34a', icon: 'checkmark-circle' };
      }
    }
  };

  return (
    <ScrollView style={styles.tabContent}>
      {/* 헤더 */}
      <View style={styles.diseaseHeader}>
        <Ionicons name="medkit" size={28} color={COLORS.primary} />
        <Text style={styles.diseaseHeaderTitle}>🔬 AI 병해충 진단</Text>
        <Text style={styles.diseaseHeaderSubtitle}>
          Gemini AI가 토마토 상태를 분석합니다
        </Text>
      </View>

      {/* 이미지 선택 버튼 */}
      <View style={styles.imageSelectCard}>
        <Text style={styles.cardTitle}>📷 이미지 선택</Text>
        <View style={styles.imageSelectButtons}>
          <TouchableOpacity 
            style={styles.imageSelectButton} 
            onPress={takePhoto}
            disabled={isAnalyzing}
          >
            <View style={styles.imageSelectIconWrapper}>
              <Ionicons name="camera" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.imageSelectButtonText}>카메라 촬영</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.imageSelectButton} 
            onPress={pickImage}
            disabled={isAnalyzing}
          >
            <View style={styles.imageSelectIconWrapper}>
              <Ionicons name="images" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.imageSelectButtonText}>갤러리 선택</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 이미지 미리보기 */}
      <View style={styles.imageContainer}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="leaf-outline" size={64} color="#ccc" />
            <Text style={styles.placeholderText}>토마토 사진을 선택해주세요</Text>
          </View>
        )}

        {isAnalyzing && (
          <View style={styles.analyzingOverlay}>
            <ActivityIndicator size="large" color={COLORS.white} />
            <Text style={styles.analyzingText}>🔬 AI 병해충 진단 중...</Text>
          </View>
        )}

        {selectedImage && !isAnalyzing && (
          <View style={styles.imageSelectedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
            <Text style={styles.imageSelectedText}>이미지 준비됨</Text>
          </View>
        )}
      </View>

      {/* 분석 버튼 */}
      <View style={styles.card}>
        <TouchableOpacity
          style={[
            styles.diseaseAnalyzeButton, 
            isAnalyzing && styles.buttonDisabled,
            !selectedImage && styles.buttonDisabled
          ]}
          onPress={handleDiseaseAnalysis}
          disabled={isAnalyzing || !selectedImage}
        >
          {isAnalyzing ? (
            <>
              <ActivityIndicator size="small" color={COLORS.white} />
              <Text style={styles.buttonText}>Gemini AI 분석 중...</Text>
            </>
          ) : (
            <>
              <Ionicons name="search" size={24} color={COLORS.white} />
              <Text style={styles.buttonText}>병해충 진단 시작</Text>
            </>
          )}
        </TouchableOpacity>
        
        {!selectedImage && (
          <Text style={styles.hintText}>먼저 이미지를 선택해주세요</Text>
        )}
      </View>

      {/* 진단 결과 */}
      {diagnosisResult && (
        <>
          {getHealthStatus() && (
            <View style={[styles.healthStatusCard, { borderColor: getHealthStatus().color }]}>
              <Ionicons 
                name={getHealthStatus().icon} 
                size={32} 
                color={getHealthStatus().color} 
              />
              <View style={styles.healthStatusContent}>
                <Text style={[styles.healthStatusLabel, { color: getHealthStatus().color }]}>
                  진단 결과
                </Text>
                <Text style={[styles.healthStatusValue, { color: getHealthStatus().color }]}>
                  {getHealthStatus().status}
                </Text>
              </View>
              <Text style={styles.healthStatusTime}>{formatAnalysisTime()}</Text>
            </View>
          )}

          <View style={styles.diagnosisCard}>
            <View style={styles.diagnosisHeader}>
              <Ionicons name="document-text" size={20} color={COLORS.primary} />
              <Text style={styles.diagnosisTitle}>📋 상세 진단 결과</Text>
            </View>
            <ScrollView style={styles.diagnosisContent} nestedScrollEnabled={true}>
              <Text style={styles.diagnosisText}>{diagnosisResult.analysis}</Text>
            </ScrollView>
          </View>
        </>
      )}

      {/* 안내 */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={20} color={COLORS.info} />
        <Text style={styles.infoText}>
          🔬 Gemini AI가 토마토의 병해충 상태를 분석합니다.{'\n'}
          📸 선명한 사진일수록 정확한 진단이 가능합니다.{'\n'}
          💡 잎, 줄기, 열매를 가까이서 촬영해주세요.
        </Text>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

// ========================================
// 스타일
// ========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textLight,
    marginLeft: 6,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  tabContent: {
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorBannerText: {
    flex: 1,
    marginLeft: 8,
    color: '#dc2626',
    fontSize: 14,
  },
  retryText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
  },
  streamContainer: {
    position: 'relative',
    backgroundColor: '#000',
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    aspectRatio: 16 / 9,
  },
  noStreamPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  noStreamText: {
    color: '#888',
    fontSize: 16,
    marginTop: 12,
  },
  noStreamSubText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  streamImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  liveIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666',
    marginRight: 6,
  },
  liveDotActive: {
    backgroundColor: '#ef4444',
  },
  liveText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  refreshButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 20,
  },
  imageContainer: {
    position: 'relative',
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    aspectRatio: 4 / 3,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#888',
    marginTop: 12,
    fontSize: 14,
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingText: {
    color: COLORS.white,
    marginTop: 12,
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultTime: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  rateContainer: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#dcfce7',
    borderRadius: 12,
  },
  rateLabel: {
    fontSize: 14,
    color: '#166534',
  },
  rateValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  resultGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  resultItem: {
    alignItems: 'center',
  },
  resultEmoji: {
    fontSize: 24,
  },
  resultValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 4,
  },
  resultLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
  card: {
    margin: 16,
    marginTop: 0,
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
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeActive: {
    backgroundColor: '#dcfce7',
  },
  statusBadgeInactive: {
    backgroundColor: '#f3f4f6',
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  statusBadgeTextActive: {
    color: '#16a34a',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    padding: 16,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 8,
  },
  infoCard: {
    flexDirection: 'row',
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    color: '#1e40af',
    fontSize: 13,
    lineHeight: 20,
  },
  imageSelectCard: {
    margin: 16,
    marginBottom: 0,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageSelectButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  imageSelectButton: {
    alignItems: 'center',
    padding: 16,
    flex: 1,
  },
  imageSelectIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  imageSelectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  imageSelectedBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  imageSelectedText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
  },
  hintText: {
    textAlign: 'center',
    color: COLORS.textLight,
    fontSize: 13,
    marginTop: 4,
  },
  intervalRow: {
    marginBottom: 16,
  },
  intervalLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  intervalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  intervalButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  intervalButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  intervalButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  intervalButtonTextActive: {
    color: COLORS.white,
  },
  autoAnalysisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    gap: 8,
  },
  autoAnalysisButtonActive: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  autoAnalysisButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  autoAnalysisButtonTextActive: {
    color: COLORS.white,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearLogButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  clearLogText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  logContainer: {
    maxHeight: 300,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
  },
  emptyLogText: {
    textAlign: 'center',
    color: COLORS.textLight,
    fontSize: 14,
    paddingVertical: 20,
  },
  logItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  logIconContainer: {
    width: 24,
    alignItems: 'center',
    paddingTop: 2,
  },
  logContent: {
    flex: 1,
    paddingLeft: 8,
  },
  logTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logMessage: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  logTime: {
    fontSize: 11,
    color: COLORS.textLight,
    marginLeft: 8,
  },
  logDataRow: {
    marginTop: 6,
    padding: 8,
    backgroundColor: '#e0f2fe',
    borderRadius: 8,
  },
  logDataText: {
    fontSize: 12,
    color: '#0369a1',
    lineHeight: 18,
  },
  logRipeness: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#16a34a',
    marginTop: 4,
  },
  diseaseHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 8,
  },
  diseaseHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
  },
  diseaseHeaderSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  diseaseAnalyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c3aed',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 10,
  },
  healthStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginBottom: 8,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  healthStatusContent: {
    flex: 1,
    marginLeft: 12,
  },
  healthStatusLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  healthStatusValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  healthStatusTime: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  diagnosisCard: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  diagnosisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  diagnosisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  diagnosisContent: {
    maxHeight: 400,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  diagnosisText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 24,
  },
});