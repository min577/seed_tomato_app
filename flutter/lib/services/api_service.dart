// lib/services/api_service.dart
// 토마토 스마트팜 API 서비스

import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'http://seedfarm.co.kr:5678/webhook';
  static const String streamUrl = 'http://192.168.49.219:8080/stream';
  static const Duration timeout = Duration(seconds: 30);

  // ============================================================
  // 📊 데이터 조회 API
  // ============================================================

  /// 실시간 토마토 분석 데이터 조회
  static Future<Map<String, dynamic>> getRealtimeData() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/data-realtime'))
          .timeout(timeout);

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to load realtime data: ${response.statusCode}');
      }
    } catch (e) {
      return {
        'Ready': 0,
        'Not_Ready': 0,
        'Disease_Bad': 0,
        'Truss': 0,
        'error': e.toString(),
      };
    }
  }

  /// 과거 토마토 분석 데이터 조회
  static Future<Map<String, dynamic>> getHistoryData({int hours = 1}) async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/data-history?hours=$hours'))
          .timeout(timeout);

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to load history data: ${response.statusCode}');
      }
    } catch (e) {
      return {'data': [], 'error': e.toString()};
    }
  }

  /// 오늘 일일 요약 데이터 조회
  static Future<Map<String, dynamic>> getDailySummary() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/data-summary'))
          .timeout(timeout);

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to load summary: ${response.statusCode}');
      }
    } catch (e) {
      return {
        'total_ready': 0,
        'total_not_ready': 0,
        'total_disease': 0,
        'avg_truss': 0,
        'error': e.toString(),
      };
    }
  }

  // ============================================================
  // 🏠 홈 화면 통합 API
  // ============================================================

  /// 홈 화면 통합 데이터 조회
  static Future<Map<String, dynamic>> getHomeData() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/app/home'))
          .timeout(timeout);

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to load home data: ${response.statusCode}');
      }
    } catch (e) {
      return {
        'success': false,
        'realtime': {'ready': 0, 'not_ready': 0, 'disease': 0, 'truss': 0},
        'today_summary': {
          'total_detected': 0,
          'total_ready': 0,
          'total_disease': 0,
          'harvest_rate': 0
        },
        'alerts': [],
        'error': e.toString(),
      };
    }
  }

  // ============================================================
  // 🎥 카메라 제어 API
  // ============================================================

  /// 즉시 촬영 및 분석
  static Future<Map<String, dynamic>> captureNow() async {
    try {
      final response = await http
          .post(Uri.parse('$baseUrl/camera-capture'))
          .timeout(timeout);

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Capture failed: ${response.statusCode}');
      }
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  /// 테스트 촬영 (개발용)
  static Future<Map<String, dynamic>> captureTest() async {
    try {
      final response = await http
          .post(Uri.parse('$baseUrl/capture-test'))
          .timeout(timeout);

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Test capture failed: ${response.statusCode}');
      }
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  /// 카메라 상태 조회
  static Future<Map<String, dynamic>> getCameraStatus() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/camera-status'))
          .timeout(timeout);

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to get camera status: ${response.statusCode}');
      }
    } catch (e) {
      return {
        'streaming': false,
        'camera_ready': false,
        'monitoring': false,
        'error': e.toString(),
      };
    }
  }

  /// 자동 모니터링 시작
  static Future<Map<String, dynamic>> startMonitoring() async {
    try {
      final response = await http
          .post(Uri.parse('$baseUrl/camera-start'))
          .timeout(timeout);

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to start monitoring: ${response.statusCode}');
      }
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  /// 자동 모니터링 중지
  static Future<Map<String, dynamic>> stopMonitoring() async {
    try {
      final response = await http
          .post(Uri.parse('$baseUrl/camera-stop'))
          .timeout(timeout);

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to stop monitoring: ${response.statusCode}');
      }
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  // ============================================================
  // 🤖 AI 분석 API
  // ============================================================

  /// AI 챗봇 메시지 전송
  static Future<Map<String, dynamic>> sendChatMessage(String message) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/app/chat'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'message': message,
          'api_key': 'tomato-farm-2024',
        }),
      ).timeout(timeout);

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Chat failed: ${response.statusCode}');
      }
    } catch (e) {
      return {
        'success': false,
        'response': '죄송합니다. 서버 연결에 실패했습니다.',
        'error': e.toString(),
      };
    }
  }

  /// Base64 이미지 YOLO 분석
  static Future<Map<String, dynamic>> analyzeImage(String base64Image) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/capture-analyze'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'image': base64Image,
          'mimeType': 'image/jpeg',
          'fileName': 'capture.jpg',
        }),
      ).timeout(const Duration(seconds: 60));

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Analysis failed: ${response.statusCode}');
      }
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  /// 병해충 AI 진단
  static Future<Map<String, dynamic>> diagnosDisease(String base64Image) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/disease-diagnosis'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'image': base64Image,
          'mimeType': 'image/jpeg',
        }),
      ).timeout(const Duration(seconds: 60));

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Diagnosis failed: ${response.statusCode}');
      }
    } catch (e) {
      return {
        'success': false,
        'diagnosis': '진단 중 오류가 발생했습니다.',
        'error': e.toString(),
      };
    }
  }

  // ============================================================
  // 💰 시장 가격 API
  // ============================================================

  /// 실시간 시장 가격 조회
  static Future<Map<String, dynamic>> getMarketPrice() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/market-price'))
          .timeout(timeout);

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to get market price: ${response.statusCode}');
      }
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  /// 도매가 vs 온라인가 비교
  static Future<Map<String, dynamic>> getPriceCompare() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/price-compare'))
          .timeout(timeout);

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to get price compare: ${response.statusCode}');
      }
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  /// 가격 추이 조회
  static Future<Map<String, dynamic>> getPriceHistory({
    String? start,
    String? end,
  }) async {
    try {
      String url = '$baseUrl/price-history';
      List<String> params = [];
      if (start != null) params.add('start=$start');
      if (end != null) params.add('end=$end');
      if (params.isNotEmpty) url += '?${params.join('&')}';

      final response = await http.get(Uri.parse(url)).timeout(timeout);

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to get price history: ${response.statusCode}');
      }
    } catch (e) {
      return {'success': false, 'data': [], 'error': e.toString()};
    }
  }

  // ============================================================
  // 🌱 수확량 예측 API
  // ============================================================

  /// 수확량 예측
  static Future<Map<String, dynamic>> predictYield({
    required double temperature,
    required double humidity,
    int? month,
    double? co2,
    double? solarRadiation,
    String? growthStage,
    String? facilityType,
  }) async {
    try {
      final body = {
        'temperature': temperature,
        'humidity': humidity,
      };

      if (month != null) body['month'] = month;
      if (co2 != null) body['co2'] = co2;
      if (solarRadiation != null) body['solar_radiation'] = solarRadiation;
      if (growthStage != null) body['growth_stage'] = growthStage;
      if (facilityType != null) body['facility_type'] = facilityType;

      final response = await http.post(
        Uri.parse('$baseUrl/yield-prediction'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(body),
      ).timeout(timeout);

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Prediction failed: ${response.statusCode}');
      }
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  // ============================================================
  // 📝 농장 일지 API
  // ============================================================

  /// 일지 목록 조회
  static Future<Map<String, dynamic>> getDiaryList({int days = 7}) async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/app/diary?days=$days'))
          .timeout(timeout);

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to get diary: ${response.statusCode}');
      }
    } catch (e) {
      return {'success': false, 'entries': [], 'error': e.toString()};
    }
  }

  /// 일지 저장
  static Future<Map<String, dynamic>> saveDiary({
    String? date,
    double? harvestKg,
    String? memo,
  }) async {
    try {
      final body = <String, dynamic>{};
      if (date != null) body['date'] = date;
      if (harvestKg != null) body['harvest_kg'] = harvestKg;
      if (memo != null) body['memo'] = memo;

      final response = await http.post(
        Uri.parse('$baseUrl/app/diary'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(body),
      ).timeout(timeout);

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to save diary: ${response.statusCode}');
      }
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }
}
