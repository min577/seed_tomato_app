// api/api.js - 통합 API 파일

const N8N_BASE_URL = 'http://seedfarm.co.kr:5678/webhook';

// ===== 시장 가격 API =====

/**
 * 가격 비교 데이터 조회 (도매가 + 온라인가)
 */
export const getPriceCompare = async () => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/price-compare`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('가격 비교 API 오류:', error);
    throw error;
  }
};

/**
 * 쇼핑 트렌드 데이터 조회 (90일 검색 추이)
 */
export const getShoppingTrend = async () => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/shopping-trend`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('쇼핑 트렌드 API 오류:', error);
    throw error;
  }
};

/**
 * 키워드 분석 데이터 조회 (인기 검색어)
 */
export const getKeywordAnalysis = async () => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/keyword-analysis`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('키워드 분석 API 오류:', error);
    throw error;
  }
};

// ===== KAMIS 도매가 API =====

export const getKamisPrice = async () => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/kamis-price`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
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
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('실시간 데이터 API 오류:', error);
    throw error;
  }
};

export const getHistoryData = async (hours = 24) => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/data-history?hours=${hours}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('히스토리 데이터 API 오류:', error);
    throw error;
  }
};

export const getDailySummary = async () => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/data-summary`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('일일 요약 API 오류:', error);
    throw error;
  }
};

// ===== 홈 화면 통합 데이터 =====

/**
 * 홈 화면용 데이터 조회 (실시간 데이터 + 필드명 매핑)
 */
export const getHomeData = async () => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/data-realtime`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const raw = await response.json();
    
    // 필드명 매핑 (대문자 → 소문자, realtime 객체로 감싸기)
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
    // 에러 시 기본값 반환
    return {
      realtime: {
        ready: 0,
        not_ready: 0,
        disease: 0,
        truss: 0,
      },
      error: error.message,
    };
  }
};

// ===== 카메라 제어 API =====

export const getCameraStatus = async () => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/camera-status`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
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
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('즉시 촬영 API 오류:', error);
    throw error;
  }
};

/**
 * 테스트 촬영 (라즈베리파이 없이 테스트용)
 */
export const captureTest = async () => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/capture-test`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
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
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
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
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ interval }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
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
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('챗봇 API 오류:', error);
    throw error;
  }
};

// ===== 수확량 예측 API =====

export const predictYield = async (data) => {
  try {
    const response = await fetch('http://192.168.49.101:8002/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('수확량 예측 API 오류:', error);
    throw error;
  }
};

export default {
  getPriceCompare,
  getShoppingTrend,
  getKeywordAnalysis,
  getKamisPrice,
  getRealtimeData,
  getHistoryData,
  getDailySummary,
  getHomeData,
  getCameraStatus,
  captureNow,
  captureTest,
  startMonitoring,
  stopMonitoring,
  setCaptureInterval,
  sendChatMessage,
  predictYield,
};