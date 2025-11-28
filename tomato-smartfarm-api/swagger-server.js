/**
 * 토마토 스마트팜 API Swagger 서버
 * 
 * n8n 워크플로우 기반 API 문서화 서버입니다.
 * 실제 API 요청은 n8n 서버(seedfarm.co.kr:5678)로 전달됩니다.
 */

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3300;

// CORS 설정
app.use(cors());

// JSON 파싱
app.use(express.json());

// Swagger 문서 로드
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger', 'swagger.yaml'));

// Swagger UI 옵션
const swaggerOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #e53935; }
    .swagger-ui .info .title::before { content: "🍅 "; }
  `,
  customSiteTitle: "토마토 스마트팜 API",
  customfavIcon: "https://em-content.zobj.net/source/apple/354/tomato_1f345.png"
};

// Swagger UI 라우트
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

// 헬스체크
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: '토마토 스마트팜 API 문서 서버',
    swagger_ui: `http://localhost:${PORT}/api-docs`,
    api_server: 'http://seedfarm.co.kr:5678/webhook'
  });
});

// OpenAPI JSON 엔드포인트
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerDocument);
});

// 서버 시작
app.listen(PORT, () => {
  console.log('');
  console.log('🍅 토마토 스마트팜 API 문서 서버');
  console.log('================================');
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`📄 OpenAPI JSON: http://localhost:${PORT}/api-docs.json`);
  console.log(`🔗 API 서버: http://seedfarm.co.kr:5678/webhook`);
  console.log('');
});
