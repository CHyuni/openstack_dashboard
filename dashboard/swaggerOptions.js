const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'OpenStack 대시보드 API',
      version: '1.0.0',
      description: 'OpenStack 대시보드 API 문서입니다.',
    },
  },
  apis: ['./routes/*.js'], // API 라우트 파일 경로 설정
};

const specs = swaggerJsdoc(options);

module.exports = specs;