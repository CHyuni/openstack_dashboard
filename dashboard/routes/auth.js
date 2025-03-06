const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * @swagger
 * /api/auth/keystone:
 *   post:
 *     summary: Keystone 인증
 *     description: Keystone API를 사용하여 인증하고 토큰과 project_id를 발급합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: 사용자 ID
 *               password:
 *                 type: string
 *                 description: 비밀번호
 *               projectName:
 *                 type: string
 *                 description: 프로젝트 이름
 *               domainName:
 *                 type: string
 *                 description: 도메인 이름
 *     responses:
 *       200:
 *         description: 인증 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: 발급된 토큰
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 에러 메시지
 */

router.post('/keystone', async (req, res) => {
    try {
      const { username, password, projectName, domainName } = req.body;
  
      // Keystone API 요청 페이로드 (Payload)
      const payload = {
        "auth": {
          "identity": {
            "methods": ["password"],
            "password": {
              "user": {
                "name": username,
                "domain": {
                  "name": "Default"
                },
                "password": password
              }
            }
          },
          "scope": {
            "project": {
              "name": projectName,
              "domain": {
                "name": domainName
              }
            }
          }
        }
      };
  
      // Keystone API 호출
      const keystoneAuthUrl = process.env.OS_AUTH_URL + '/v3/auth/tokens';
      const keystoneResponse = await axios.post(keystoneAuthUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      // Keystone API 응답에서 토큰 추출
      const project_id = keystoneAuthUrl.data.token.project.id
      const token = keystoneResponse.headers['x-subject-token'];
  
      // 응답 전송
      res.json({ token: token, project_id: project_id });
      // res.json({ token: token })
  
    } catch (error) {
      console.error('Keystone 인증 실패:', error);
      res.status(401).json({ message: 'Keystone 인증 실패' });
    }
});

/**
 * @swagger
 * /api/auth/auto-login:
 *  post:
 *    summary: Keystone 자동 로그인
 *    description: 서버 환경 변수를 사용하여 페이지 접속 시 우선적으로 자동 로그인 진행.
 *    responses:
 *      200:
 *        description: 자동 로그인 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                token:
 *                  type: string
 *                  description: 발급된 토큰
 *      401:
 *        description: 자동 로그인 실패
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: 에러 메시지
 */
router.post('/auto-login', async (req, res) => {
  try {
    // 서버 환경 변수에서 인증 정보 가져오기
    const keystoneAuthUrl = await axios.post(process.env.OS_AUTH_URL + '/v3/auth/tokens', {
      auth: {
        identity: {
          methods: ['password'],
          password: {
            user: {
              name: process.env.OS_USERNAME,
              domain: { name: process.env.OS_USER_DOMAIN_NAME },
              password: process.env.OS_PASSWORD
            }
          }
        },
        scope: {
          project: {
            name: process.env.OS_PROJECT_NAME,
            domain: { name: process.env.OS_PROJECT_DOMAIN_NAME }
          }
        }
      }
    });
    
    // 토큰 추출 및 반환
    const project_id = keystoneAuthUrl.data.token.project.id
    const token = keystoneAuthUrl.headers['x-subject-token'];
    res.json({ token: token, project_id: project_id});
    // res.json({ token: token })
  } catch (error) {
    console.error('Keystone 자동 로그인 실패:', error);
    res.status(401).json({ error: '자동 로그인 실패' });
  }
});

module.exports = router;