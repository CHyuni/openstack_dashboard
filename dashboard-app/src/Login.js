import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({ setToken }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [projectName, setProjectName] = useState('admin');
    const [domainName, setDomainName] = useState('Default');
    const navigate = useNavigate();

    useEffect(() => {
        const autoLogin = async () => {
            try {
                const response = await axios.post('/api/auth/auto-login');

                const token = response.data;
                setToken(token);

                navigate('/dashboard');
            } catch (error) {
                console.error('자동 로그인 실패:', error);
            } finally {
                setIsLoading(false);
            }
        }
        autoLogin();
    }, [navigate, setToken]);

    if (isLoading) {
        return <div>Loading...</div>; // 로딩 화면 표시
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            // 백엔드 API 호출 (axios 사용)
            const response = await axios.post('/api/auth/keystone', {
            username: username,
            password: password,
            projectName: projectName,
            domainName: domainName,
            });

            // 인증 성공
            const token = response.data;
            setToken(token); // App.js에서 받아온 setToken 함수 호출

            // 대시보드 페이지로 이동
            navigate('/dashboard');
        } catch (error) {
            // 인증 실패
            console.error('로그인 실패:', error);
            alert('로그인에 실패했습니다.');
        }
    };

  return (
    <div>
        <h1>로그인</h1>
        <form onSubmit={handleSubmit}>
        <label>
            사용자 ID:
            <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            />
        </label>
        <br />
        <label>
            비밀번호:
            <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />
        </label>
        <br />
        <label>
            프로젝트 이름:
            <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
            />
        </label>
        <br />
        <label>
            도메인 이름:
            <input
                type="text"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
            />
        </label>
        <br />
        <button type="submit">로그인</button>
        </form>
    </div>
  );
}

export default Login;