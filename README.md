# OpenStack Horizon 대시보드 Node.js 이식 프로젝트

## 개요

본 프로젝트는 OpenStack Horizon 대시보드의 확장성 및 유지보수성을 개선하기 위해 Node.js를 활용하여 핵심 기능들을 재구현하는 것을 목표로 합니다. 성능 및 확장성을 고려하여 Node.js 기반 백엔드 API와 함께 Nginx를 사용하여 React 기반 프론트엔드를 배포하는 아키텍처를 구축했습니다.

## 주요 특징

*   **Horizon 기능 이식:** Horizon 대시보드의 일부 기능을 Node.js 환경으로 이식
*   **Node.js 기반 API:** OpenStack API 연동을 위한 효율적인 Node.js 기반 API 개발
*   **React 기반 UI:** 향후 디자인 및 기능 확장을 고려하여 React를 프론트엔드 기술로 선택 (현재 기본적인 기능 구현 완료, 스타일 미적용)
*   **Nginx 배포:** React 기반 UI를 Nginx 웹 서버를 통해 배포하여 성능 및 확장성 확보

## 기술 스택

*   **Kolla-ansible:** OpenStack 배포 및 관리 자동화 도구 (기존 환경 활용)
*   **Node.js:** 백엔드 API 및 로직 구현
*   **React:** 사용자 인터페이스 (UI) 프레임워크 (향후 확장 및 기능 추가를 위해 도입, 현재 스타일 미적용)
*   **Nginx:** 웹 서버 및 리버스 프록시 (React UI 배포)

## 실행 방법 (개발 환경 기준)

1.  **저장소 클론:**
    ```bash
    git clone https://github.com/CHyuni/openstack_dashboard
    ```

2.  **프로젝트 디렉토리 이동:**
    ```bash
    cd openstack_dashboard
    ```

3.  **OpenStack 환경 설정 확인:**
    *   Kolla-ansible로 배포된 OpenStack 환경이 구성되어 있는지 확인합니다.
    *   OpenStack 환경 변수가 올바르게 설정되어 있는지 확인합니다.
        ```bash
        source /etc/kolla/*-openrc.sh
        ```
    *   Glance 및 Nova API 엔드포인트가 설정되어 있는지 확인합니다.
        ```bash
        echo $GLANCE_API_ENDPOINT
        echo $OS_COMPUTE_URL
        ```

4.  **Dashboard 디렉토리 이동:**
    ```bash
    cd dashboard
    ```

5.  **Node.js 의존성 설치:**
    ```bash
    npm install
    ```

6.  **React 앱 빌드 및 Nginx 배포:**

    *   `dashboard-app` 디렉토리로 이동
        ```bash
        cd ../dashboard-app
        ```

    *   React 의존성 설치
        ```bash
        npm install
        ```

    *   React 앱 빌드
        ```bash
        npm run build
        ```

    *   Nginx 설정 (별도 설정 파일 필요)
    *   Nginx 서버 실행 (빌드된 React 앱 배포)
        ```bash
        # (예시) sudo nginx -c /path/to/nginx.conf
        ```

## 주요 기능

*   **Flavor 목록 조회:** OpenStack에 등록된 Flavor 정보를 조회합니다.
*   **Flavor 생성:** VCPU, RAM, Disk 용량 및 Flavor 이름을 입력하여 새로운 Flavor를 생성합니다.
*   **QCOW2 이미지 등록:** QCOW2 형식의 이미지를 OpenStack Glance에 등록합니다.
*   **가상 머신 생성:** 이름, Flavor, 이미지, ID 및 비밀번호를 입력하여 새로운 가상 머신을 생성합니다.

## 제한 사항 및 향후 과제

*   현재 디스크 용량은 최대 5GB로 제한되어 있습니다.
*   UI 디자인 및 스타일 개선 (현재 스타일 미적용), API 기능 확장, 에러 처리 강화, 테스트 코드 작성 등이 필요합니다.
*   React 기반 UI 프레임워크를 활용한 컴포넌트 기반 아키텍처 구축 및 재사용성 향상 계획

## 추가 정보

*   본 프로젝트는 Node.js 기반 백엔드 API와 Nginx를 통해 배포된 React 프론트엔드를 결합하여 OpenStack 클라우드 환경을 관리하는 가능성을 제시합니다.
*   Nginx를 사용하여 React 앱을 배포함으로써 성능 및 확장성을 고려했습니다.
