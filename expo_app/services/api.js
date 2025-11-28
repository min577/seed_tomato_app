// services/api.js - 통합 API 파일

// ===== URL 상수 (export) =====
export const N8N_BASE_URL = 'http://seedfarm.co.kr:5678/webhook';
export const RASPBERRY_URL = 'http://192.168.49.219:8080';
export const STREAM_URL = `${RASPBERRY_URL}/stream`;
export const SNAPSHOT_URL = `${RASPBERRY_URL}/snapshot`;
export const YIELD_API_URL = 'http://192.168.49.101:8002';

// ===== 시장 가격 API =====

// 가격 비교 (실시간 - 캐시 방지)
export const getPriceCompare = async () => {
  try {
    const timestamp = Date.now();
    const response = await fetch(`${N8N_BASE_URL}/price-compare?_t=${timestamp}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('가격 비교 API 오류:', error);
    throw error;
  }
};

// 가격 추이 (캐싱 허용 - 과거 데이터)
export const getPriceHistory = async (start, end) => {
  try {
    const response = await fetch(
      `${N8N_BASE_URL}/price-history?start=${start}&end=${end}`
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('가격 추이 API 오류:', error);
    throw error;
  }
};

export const getShoppingTrend = async () => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/shopping-trend`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('쇼핑 트렌드 API 오류:', error);
    throw error;
  }
};

export const getKeywordAnalysis = async () => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/keyword-analysis`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('키워드 분석 API 오류:', error);
    throw error;
  }
};

export const getKamisPrice = async () => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/kamis-price`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('KAMIS API 오류:', error);
    throw error;
  }
};

// ===== 실시간 데이터 API =====

export const getRealtimeData = async () => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/data-realtime`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('실시간 데이터 API 오류:', error);
    throw error;
  }
};

export const getHistoryData = async (hours = 24) => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/data-history?hours=${hours}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('히스토리 데이터 API 오류:', error);
    throw error;
  }
};

export const getDailySummary = async () => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/data-summary`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('일일 요약 API 오류:', error);
    throw error;
  }
};

export const getHomeData = async () => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/data-realtime`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const raw = await response.json();
    
    return {
      realtime: {
        ready: raw.Ready ?? 0,
        not_ready: raw.Not_Ready ?? 0,
        disease: raw.Disease_Bad ?? 0,
        truss: raw.Truss ?? 0,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('홈 데이터 API 오류:', error);
    return {
      realtime: { ready: 0, not_ready: 0, disease: 0, truss: 0 },
      error: error.message,
    };
  }
};

// ===== 라즈베리파이 API =====

export const getRaspberryStatus = async () => {
  try {
    const response = await fetch(`${RASPBERRY_URL}/`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('라즈베리파이 상태 API 오류:', error);
    throw error;
  }
};

export const startRaspberryStream = async () => {
  try {
    const response = await fetch(`${RASPBERRY_URL}/start`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('스트리밍 시작 API 오류:', error);
    throw error;
  }
};

// ===== 카메라 제어 API =====

export const getCameraStatus = async () => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/camera-status`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('카메라 상태 API 오류:', error);
    throw error;
  }
};

export const captureNow = async () => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/camera-capture`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('즉시 촬영 API 오류:', error);
    throw error;
  }
};

export const captureTest = async () => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/capture-test`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('테스트 촬영 API 오류:', error);
    throw error;
  }
};

export const startMonitoring = async () => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/camera-start`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('모니터링 시작 API 오류:', error);
    throw error;
  }
};

export const stopMonitoring = async () => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/camera-stop`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('모니터링 중지 API 오류:', error);
    throw error;
  }
};

export const setCaptureInterval = async (interval) => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/camera-interval`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interval }),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('간격 설정 API 오류:', error);
    throw error;
  }
};

// ===== AI 챗봇 API =====

export const sendChatMessage = async (message, image = null) => {
  try {
    const formData = new FormData();
    formData.append('message', message);
    
    if (image) {
      formData.append('image', {
        uri: image.uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });
    }
    
    const response = await fetch(`${N8N_BASE_URL}/chat-message`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('챗봇 API 오류:', error);
    throw error;
  }
};

// ===== 토마토 이미지 분석 API =====

export const analyzeTomato = async (image) => {
  try {
    // 이미지 URI에서 Base64로 변환
    const imageResponse = await fetch(image.uri);
    const blob = await imageResponse.blob();
    
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        // data:image/jpeg;base64, 부분 제거
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // n8n capture-analyze 엔드포인트 호출
    const response = await fetch(`${N8N_BASE_URL}/capture-analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: base64,
        mimeType: image.mimeType || 'image/jpeg',
        fileName: 'capture.jpg',
      }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    
    // 응답 형식 정규화
    return {
      ready: data.data?.Ready ?? data.Ready ?? 0,
      not_ready: data.data?.Not_Ready ?? data.Not_Ready ?? 0,
      disease: data.data?.Disease_Bad ?? data.Disease_Bad ?? 0,
      truss: data.data?.Truss ?? data.Truss ?? 0,
      recommendation: data.message || '',
      success: data.success ?? true,
    };
  } catch (error) {
    console.error('토마토 분석 API 오류:', error);
    throw error;
  }
};

// ===== 병해충 진단 API =====

export const runDiseaseAnalysis = async (base64Image, mimeType = 'image/jpeg') => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/disease-diagnosis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: base64Image,
        mimeType: mimeType,
      }),
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const responseText = await response.text();
    if (!responseText || responseText.trim() === '') {
      throw new Error('서버에서 빈 응답');
    }
    
    return JSON.parse(responseText);
  } catch (error) {
    console.error('병해충 진단 API 오류:', error);
    throw error;
  }
};

// ===== 수확량 예측 API =====

export const predictYield = async (data) => {
  try {
    const response = await fetch(`${YIELD_API_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('수확량 예측 API 오류:', error);
    throw error;
  }
};

// ===== Default Export =====

export default {
  // URL 상수
  N8N_BASE_URL,
  RASPBERRY_URL,
  STREAM_URL,
  SNAPSHOT_URL,
  YIELD_API_URL,
  // 시장 가격
  getPriceCompare,
  getPriceHistory,
  getShoppingTrend,
  getKeywordAnalysis,
  getKamisPrice,
  // 실시간 데이터
  getRealtimeData,
  getHistoryData,
  getDailySummary,
  getHomeData,
  // 라즈베리파이
  getRaspberryStatus,
  startRaspberryStream,
  // 카메라
  getCameraStatus,
  captureNow,
  captureTest,
  startMonitoring,
  stopMonitoring,
  setCaptureInterval,
  // AI
  sendChatMessage,
  analyzeTomato,
  runDiseaseAnalysis,
  predictYield,
};