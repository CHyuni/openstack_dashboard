const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const stream = require('stream');

const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /api/glance/images:
 *   get:
 *     summary: 이미지 목록 조회
 *     description: Glance API를 사용하여 이미지 목록을 조회합니다.
 *     security:
 *       - BearerAuth: []  # JWT 또는 API Key 인증을 사용하는 경우
 *     parameters:
 *       - in: header
 *         name: X-Auth-Token
 *         required: true
 *         description: Keystone에서 발급받은 인증 토큰
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 이미지 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 images:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: 이미지 객체 (Glance API 응답 구조에 따라 상세 스키마 정의 필요)
 *       401:
 *         description: 인증 실패 (토큰 없음)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 에러 메시지
 *       500:
 *         description: 이미지 목록 조회 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 에러 메시지
 *                 error:
 *                   type: string
 *                   description: 상세 에러 정보
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: apiKey
 *       in: header
 *       name: X-Auth-Token
 *       description: "Enter your bearer token in the format **X-Auth-Token"
 */
router.get('/images', async (req, res) => {
  try {
    const token = req.headers['x-auth-token'];
    if (!token) {
      return res.status(401).json({ message: '토큰이 없습니다.' });
    }

    const glanceUrl = `${process.env.GLANCE_API_ENDPOINT}/v2/images`;

    const response = await axios.get(glanceUrl, {
      headers: {
        'X-Auth-Token': token,
        'Content-Type': 'application/json'
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Image 목록 조회 실패:', error);
    res.status(500).json({ message: 'Flavor 조회 실패', error: error.response ? error.response.data : error.message});
  }
})

/**
 * @swagger
 * /api/glance/images:
 *   post:
 *     summary: 이미지 생성
 *     description: Glance API를 사용하여 이미지를 생성합니다.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Auth-Token
 *         required: true
 *         description: Keystone에서 발급받은 인증 토큰
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 이미지 이름
 *               disk_format:
 *                 type: string
 *                 description: QCOW2
 *               container_format:
 *                 type: string
 *                 description: BARE
 *               visibility:
 *                 type: string
 *                 enum: [public, private]
 *                 description: 이미지 공개 범위
 *     responses:
 *       201:
 *         description: 이미지 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: 생성된 이미지 ID
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패 (토큰 없음)
 *       500:
 *         description: 이미지 생성 실패
 */
router.post('/images', async (req, res) => {
    try {
      const { name, disk_format, container_format, visibility } = req.body;
      const token = req.headers['x-auth-token']; // 헤더에서 토큰 추출
      if (!token) {
          return res.status(401).json({ message: '토큰이 없습니다.' });
      }
  
      // 1. Glance API 엔드포인트 및 헤더 설정
      const glanceUrl = process.env.GLANCE_API_ENDPOINT + '/v2/images';
  
      // 2. Glance API에 이미지 정보 생성 요청
      const response = await axios.post(glanceUrl, {
        name,
        disk_format,
        container_format,
        visibility,
      }, {headers: {
        'X-Auth-Token': token,
        'Content-Type': 'application/json'
      }
      });
  
      // 3. 성공 응답
      res.status(201).json({ id: response.data.id }); // 이미지 ID 반환
  
    } catch (error) {
      console.error('Glance 이미지 생성 실패:', error);
      res.status(500).json({ message: 'Failed to create image in Glance', error: error.message }); // 더 자세한 에러 메시지
    }
  });
  
  
  /**
    * @swagger
    * /api/glance/images/{imageId}/file:
    *   put:
    *     summary: 이미지 파일 업로드
    *     description: Glance API를 사용하여 이미지 파일을 업로드합니다.
    *     security:
    *       - BearerAuth: []
    *     parameters:
    *       - in: header
    *         name: X-Auth-Token
    *         required: true
    *         description: Keystone에서 발급받은 인증 토큰
    *         schema:
    *           type: string
    *       - in: path
    *         name: imageId
    *         required: true
    *         description: 이미지 ID
    *         schema:
    *           type: string
    *     requestBody:
    *       required: true
    *       content:
    *         application/octet-stream:
    *           schema:
    *             type: string
    *             format: binary
    *             description: 업로드할 이미지 파일 (octet-stream)
    *     responses:
    *       204:
    *         description: 이미지 파일 업로드 성공 (No Content)
    *       400:
    *         description: 잘못된 요청
    *       401:
    *         description: 인증 실패 (토큰 없음)
    *       500:
    *         description: 이미지 파일 업로드 실패
    * components:
    *   securitySchemes:
    *     BearerAuth:
    *       type: apiKey
    *       in: header
    *       name: X-Auth-Token
    *       description: "Enter your bearer token in the format **X-Auth-Token"
   */
  // 이미지 파일 업로드 API (Glance에 이미지 파일 전송)
  router.put('/images/:imageId/file', upload.single('image'), async (req, res) => {
    try {
      const { imageId } = req.params;
      const token = req.headers['x-auth-token']; // 헤더에서 토큰 추출
      if (!token) {
          return res.status(401).json({ message: '토큰이 없습니다.' });
      }
  
      // 1. Glance API 엔드포인트 및 헤더 설정
      const glanceUrl = process.env.GLANCE_API_ENDPOINT + `/v2/images/${imageId}/file`;

      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);
  
      // 2. 프론트엔드에서 전송된 파일 데이터 Glance에 전달
      await axios.put(glanceUrl, bufferStream, {headers: {
        'X-Auth-Token': token,
        'Content-Type': 'application/octet-stream'
      }});
  
      // 3. 성공 응답
      res.status(204).send();
  
    } catch (error) {
      console.error('Glance 이미지 파일 업로드 실패:', error);
      res.status(500).json({ message: 'Failed to upload image file to Glance', error: error.message });
    }
  });
  
  module.exports = router;