const express = require('express');
const router = express.Router();
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

/**
 * @swagger
 * /servers:
 *   get:
 *     summary: 가상 머신 목록 조회
 *     description: Nova API를 사용하여 가상 머신 목록을 조회합니다.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Auth-Token
 *         required: true
 *         description: Keystone에서 발급받은 인증 토큰
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 가상 머신 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 description: 가상 머신 객체
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: 가상 머신 ID
 *                   name:
 *                     type: string
 *                     description: 가상 머신 이름
 *                   status:
 *                     type: string
 *                     description: 가상 머신 상태
 *       401:
 *         description: 인증 실패 (토큰 없음)
 *       500:
 *         description: 가상 머신 목록 조회 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 에러 메시지
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: apiKey
 *       in: header
 *       name: X-Auth-Token
 *       description: "Enter your bearer token in the format **X-Auth-Token"
 */
// 가상 머신 목록 조회
router.get('/servers', async (req, res) => {
    try {
        const token = req.headers['x-auth-token']; // 헤더에서 토큰 추출
        if (!token) {
            return res.status(401).json({ message: '토큰이 없습니다.' });
        }

        const novaUrl = process.env.OS_COMPUTE_URL + '/servers/detail'; // Compute API 엔드포인트
        const response = await axios.get(novaUrl, {
            headers: {
                'X-Auth-Token': token,
                'Content-Type': 'application/json'
            }
        });
        res.json(response.data.servers); // 가상 머신 목록 반환
    } catch (error) {
        console.error('가상 머신 목록 조회 실패:', error.code);
        res.status(500).json({ message: '가상 머신 목록 조회 실패' });
    }
});

/**
 * @swagger
 * /servers:
 *   post:
 *     summary: 가상 머신 생성
 *     description: Nova API를 사용하여 가상 머신을 생성합니다.
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
 *               server:
 *                 type: object
 *                 description: 가상 머신 생성 정보
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: 가상 머신 이름
 *                   imageRef:
 *                     type: string
 *                     description: 이미지 ID
 *                   flavorRef:
 *                     type: string
 *                     description: 플레이버 ID
 *                   networks:
 *                     type: array
 *                     description: 네트워크 정보 (API에서 자동 추가되므로 필수는 아님)
 *                     items:
 *                       type: object
 *                       properties:
 *                         uuid:
 *                           type: string
 *                           description: 네트워크 UUID
 *     responses:
 *       201:
 *         description: 가상 머신 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: 생성된 가상 머신 정보
 *               properties:
 *                 server:
 *                   type: object
 *                   properties:
 *                     statusText:
 *                       type: string
 *                       description: 가상 생성 정보
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패 (토큰 없음)
 *       500:
 *         description: 가상 머신 생성 실패
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
// 가상 머신 생성
router.post('/servers', async (req, res) => {
    try {
      const token = req.headers['x-auth-token']; // 헤더에서 토큰 추출
      if (!token) {
          return res.status(401).json({ message: '토큰이 없습니다.' });
      }
      const novaUrl = process.env.OS_COMPUTE_URL + '/servers';
      const requestBody = req.body;

      requestBody.server.networks = [
        {
          uuid: process.env.OS_NETWORK_ID,
        }
      ]
  
      const response = await axios.post(novaUrl, requestBody, {
        headers: {
          'X-Auth-Token': token,
          'Content-Type': 'application/json'
        }
      });
  
      res.status(201).json(response.data); // 성공적으로 생성된 VM 정보 반환
    } catch (error) {
      console.error('가상 머신 생성 실패:', error);
      res.status(500).json({ message: '가상 머신 생성 실패', error: error.response ? error.response.data : error.message });
    }
  });
  
/**
 * @swagger
 * /servers/{id}:
 *   delete:
 *     summary: 가상 머신 삭제
 *     description: Nova API를 사용하여 가상 머신을 삭제합니다.
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
 *         name: id
 *         required: true
 *         description: 삭제할 가상 머신 ID
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: 가상 머신 삭제 성공 (No Content)
 *       401:
 *         description: 인증 실패 (토큰 없음)
 *       404:
 *         description: 가상 머신을 찾을 수 없음
 *       500:
 *         description: 가상 머신 삭제 실패
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
// 가상 머신 삭제
router.delete('/servers/:id', async (req, res) => {
    try {
      const token = req.headers['x-auth-token']; // 헤더에서 토큰 추출
      if (!token) {
          return res.status(401).json({ message: '토큰이 없습니다.' });
      }
      const serverId = req.params.id;
      const novaUrl = process.env.OS_COMPUTE_URL + `/servers/${serverId}`;
  
      await axios.delete(novaUrl, {
        headers: {
          'X-Auth-Token': token,
          'Content-Type': 'application/json'
        }
      });
  
      res.status(204).send(); // 성공적인 삭제는 204 No Content 응답
    } catch (error) {
      console.error('가상 머신 삭제 실패:', error);
      res.status(500).json({ message: '가상 머신 삭제 실패', error: error.response ? error.response.data : error.message });
    }
  });

  /**
 * @swagger
 * /servers/{id}/action:
 *   post:
 *     summary: 가상 머신 시작/중지 (액션)
 *     description: Nova API를 사용하여 가상 머신을 시작하거나 중지합니다.
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
 *         name: id
 *         required: true
 *         description: 가상 머신 ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [start, stop]
 *                 description: 수행할 액션 (start 또는 stop)
 *     responses:
 *       202:
 *         description: 액션 요청 성공 (Accepted)
 *       400:
 *         description: 잘못된 요청 (잘못된 액션)
 *       401:
 *         description: 인증 실패 (토큰 없음)
 *       404:
 *         description: 가상 머신을 찾을 수 없음
 *       500:
 *         description: 가상 머신 액션 실패
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
// 가상 머신 시작/중지 (액션 API 활용)
router.post('/servers/:id/action', async (req, res) => {
    try {
      const token = req.headers['x-auth-token']; // 헤더에서 토큰 추출
      if (!token) {
          return res.status(401).json({ message: '토큰이 없습니다.' });
      }
      const serverId = req.params.id;
      const action = req.body.action; // 'start' 또는 'stop'
      const novaUrl = process.env.OS_COMPUTE_URL + `/servers/${serverId}/action`;
      let requestBody = {};
  
      if (action === 'start') {
        requestBody = { "os-start": null };
      } else if (action === 'stop') {
        requestBody = { "os-stop": null };
      } else {
        return res.status(400).json({ message: '잘못된 액션입니다.' });
      }
  
      const response = await axios.post(novaUrl, requestBody, {
        headers: {
          'X-Auth-Token': token,
          'Content-Type': 'application/json'
        }
      });
  
      res.status(202).send(); // 액션 요청 성공은 202 Accepted 응답
    } catch (error) {
      console.error('가상 머신 액션 실패:', error);
      res.status(500).json({ message: '가상 머신 액션 실패', error: error.response ? error.response.data : error.message });
    }
  });

  /**
 * @swagger
 * /servers/{id}/vnc:
 *   get:
 *     summary: 가상 머신 VNC 콘솔 URL 가져오기
 *     description: Nova API를 사용하여 가상 머신 VNC 콘솔 URL을 가져옵니다.
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
 *         name: id
 *         required: true
 *         description: 가상 머신 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: VNC 콘솔 URL 가져오기 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 os-getVNCConsole:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       description: VNC 콘솔 접속 URL
 *       401:
 *         description: 인증 실패 (토큰 없음)
 *       404:
 *         description: 가상 머신을 찾을 수 없음
 *       500:
 *         description: VNC 콘솔 URL 가져오기 실패
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
router.get('/servers/:id/vnc', async (req, res) => {
  try {
    const token = req.headers['x-auth-token']; // 헤더에서 토큰 추출
    if (!token) {
        return res.status(401).json({ message: '토큰이 없습니다.' });
    }

    const serverId = req.params.id;
    const novaUrl = `${process.env.OS_COMPUTE_URL}/servers/${serverId}/action`;

    const requestBody = {
      "os-getVNCConsole": {
        "type": "novnc"
      }
    };

    const response = await axios.post(novaUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('VNC 콘솔 URL 가져오기 오류:', error);
    res.status(500).json({ message: 'VNC 콘솔 URL을 가져오는 데 실패했습니다.', error: error.message });
  }
})

/**
 * @swagger
 * /compute:
 *   get:
 *     summary: Compute 자원 할당량 조회
 *     description: Nova API를 사용하여 Compute 자원 할당량 및 사용량 정보를 조회합니다.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Auth-Token
 *         required: true
 *         description: Keystone에서 발급받은 인증 토큰
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 자원 할당량 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: 자원 할당량 및 사용량 정보
 *               properties:
 *                 limits:
 *                   type: object
 *                   properties:
 *                     absolute:
 *                       type: object
 *                       description: 절대적인 자원 제한
 *                       properties:
 *                         maxTotalCores:
 *                           type: integer
 *                           description: 최대 코어 수
 *                         maxTotalRAMSize:
 *                           type: integer
 *                           description: 최대 RAM 크기 (MB)
 *                     rate:
 *                       type: array
 *                       description: 속도 제한
 *       401:
 *         description: 인증 실패 (토큰 없음)
 *       500:
 *         description: 자원 할당량 조회 실패
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
// VM 상태 모니터링 (CPU, 메모리 사용량 등) - Telemetry API (Gnocchi/Ceilometer) 필요
router.get('/compute', async (req, res) => {
  try {
    const token = req.headers['x-auth-token']; // 헤더에서 토큰 추출
    if (!token) {
      return res.status(401).json({ message: '토큰이 없습니다.' });
    }

    const limitsUrl = `${process.env.OS_COMPUTE_URL}/limits`;

    const response = await axios.get(limitsUrl, {
      headers: {
        'X-Auth-Token': token,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data); // 자원 할당량 및 사용량 정보 반환
  } catch (error) {
    console.error('자원 할당량 조회 실패:', error);
    res.status(500).json({ message: '자원 할당량 조회 실패', error: error.response ? error.response.data : error.message });
  }
});

/**
 * @swagger
 * /flavors:
 *   get:
 *     summary: Flavor 목록 조회
 *     description: Nova API를 사용하여 Flavor 목록을 조회합니다.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Auth-Token
 *         required: true
 *         description: Keystone에서 발급받은 인증 토큰
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Flavor 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 flavors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Flavor 객체
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Flavor ID
 *                       name:
 *                         type: string
 *                         description: Flavor 이름
 *                       vcpus:
 *                         type: integer
 *                         description: 가상 CPU 개수
 *                       ram:
 *                         type: integer
 *                         description: RAM 크기 (MB)
 *                       disk:
 *                         type: integer
 *                         description: 디스크 크기 (GB)
 *       401:
 *         description: 인증 실패 (토큰 없음)
 *       500:
 *         description: Flavor 조회 실패
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
router.get('/flavors', async (req, res) => {
  try {
    const token = req.headers['x-auth-token'];
    if (!token) {
      return res.status(401).json({ message: '토큰이 없습니다.'});
    }

    const flavorsUrl = `${process.env.OS_COMPUTE_URL}/flavors/detail`;

    const response = await axios.get(flavorsUrl, {
      headers: {
        'X-Auth-Token': token,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Flavor 조회 실패', error);
    res.status(500).json({ message: 'Flavor 조회 실패', error: error.response ? error.response.data : error.message});
  }
});

/**
 * @swagger
 * /flavors:
 *   post:
 *     summary: Flavor 생성
 *     description: Nova API를 사용하여 새로운 Flavor를 생성합니다.
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
 *               flavor:
 *                 type: object
 *                 description: 생성할 Flavor 정보
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Flavor 이름
 *                   ram:
 *                     type: integer
 *                     description: RAM 크기 (MB)
 *                   vcpus:
 *                     type: integer
 *                     description: 가상 CPU 개수
 *                   disk:
 *                     type: integer
 *                     description: 디스크 크기 (GB)
 *     responses:
 *       201:
 *         description: Flavor 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: 생성된 Flavor 정보
 *               properties:
 *                 flavor:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: 생성된 Flavor ID
 *                     name:
 *                       type: string
 *                       description: Flavor 이름
 *                     ram:
 *                       type: integer
 *                       description: RAM 크기 (MB)
 *                     vcpus:
 *                       type: integer
 *                       description: 가상 CPU 개수
 *                     disk:
 *                       type: integer
 *                       description: 디스크 크기 (GB)
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패 (토큰 없음)
 *       500:
 *         description: Flavor 생성 실패
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
router.post('/flavors', async (req, res) => {
  try {
    const token = req.headers['x-auth-token'];
    if (!token) {
      return res.status(401).json({ message: '토큰이 없습니다.' });
    }

    const flavorsUrl = `${process.env.OS_COMPUTE_URL}/flavors`;
    const flavorId = uuidv4();

    const requestBody = {
      flavor: {
        name: req.body.flavor.name,
        ram: req.body.flavor.ram,
        vcpus: req.body.flavor.vcpus,
        disk: req.body.flavor.disk,
        id: flavorId,
        'os-flavor-access:is_public': true,
      },
    };

    const response = await axios.post(flavorsUrl, requestBody, {
      headers: {
        'X-Auth-Token': token,
        'Content-Type': 'application/json'
      },
    });

    res.status(201).json(response.data);
  } catch (error) {
    console.error('플레이버 생성 오류:', error);
    res.status(500).json({ message: '플레이버 생성에 실패했습니다.', error: error.message });
  }
})
module.exports = router;