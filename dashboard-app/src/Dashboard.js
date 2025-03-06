import React, { useEffect, useState, useRef } from 'react';
import { useToken } from './useToken'; // 토큰 관리 훅
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import vmService from './vmService';
import useVmActions from './useVmActions';
import useImageActions from './useImageActions';
import FlavorForm from './FlavorForm';

function Dashboard() {
  const { token, projectId, removeToken } = useToken();
  const navigate = useNavigate();
  const [servers, setServers] = useState([]);
  const [flavors, setFlavors] = useState([]);
  const [images, setImages] = useState([]);
  const [compute, setCompute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vmName, setVmName] = useState('');
  const [imageName, setImageName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [result, setResult] = useState(null);
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [vmSelectedFlavor, setVmSelectedFlavor] = useState('');
  const [vmSelectedImage, setVmSelectedImage] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const fetchServers = async () => {
    try {
      const data = await vmService.fetchServers(token);
      setServers(data);
      console.log(data)
      const compute_data = await vmService.fetchCompute(token);
      setCompute(compute_data.limits.absolute);
      setLoading(false);
    } catch (error) {
      console.error('가상 머신 목록을 가져오는 데 실패했습니다.', error);
      setError(error.message || '가상 머신 목록을 가져오는 데 실패했습니다.');
      setLoading(false);
    }
  };
  
  const fetchFlavors = async () => {
    try {
      const data = await axios.get('/api/nova/flavors', {
        headers: { 'X-Auth-Token': token },
      });
      console.log(data.data.flavors, data.data.flavors.length);
      setFlavors(data.data.flavors);
    } catch(error) {
      console.error('플레이버 목록을 가져오는 데 실패했습니다.', error);
      setError(error.message || '플레이버 목록을 가져오는 데 실패했습니다.');
    }
  };

  const fetchImage = async () => {
    try {
      const data = await axios.get('/api/glance/images', {
        headers: { 'X-Auth-Token': token },
      });
      console.log(data.data.images, data.data.images.length);
      setImages(data.data.images);
    } catch(error) {
      console.error('이미지 목록을 가져오는 데 실패 했습니다.', error);
      setError(error.message || '이미지 목록을 가져오는 데 실패 했습니다.');
    }
  };

  useEffect(() => {
    if (token) {
      console.log(token);
      fetchFlavors();
      fetchImage();
      fetchServers();
    } else {
      navigate('/');
    }
  }, [token, navigate]);
  
  const { handleCreateVM, handleDeleteVM, handleStartVM, handleStopVM, handleVNCConsole } = useVmActions(token, fetchServers);
  const { handleCreateImage, handleUploadImage } = useImageActions(token);
  
  useEffect(() => {
    const uploadImage = async () => {
      if (selectedFile && handleUploadImage && result) {
        const uploadSuccess = await handleUploadImage(result, selectedFile);
        if (uploadSuccess) {
          console.log("이미지 파일 업로드 성공");
          // 업로드 성공 후 처리 (예: 알림 표시, 이미지 목록 갱신)
        } else {
          console.error("이미지 파일 업로드 실패");
          // 업로드 실패 시 처리 (예: 오류 메시지 표시)
        }
        setSelectedFile(null); // 파일 선택 초기화
        setResult(null); // result 초기화
      }
    };
  
    uploadImage();
  }, [selectedFile, handleUploadImage, result]);
  const handleLogout = () => {
    removeToken();
  };
  
  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>오류: {error}</div>;
  }

  const ramInGB = (ramInMB) => {
    if (ramInMB === undefined || ramInMB === null) {
      return '0';
    }
    return (ramInMB / 1024).toFixed(2);
  };

  const handleImageCreation = async () => {
    const creationResult = await handleCreateImage(imageName);
    console.log(creationResult);
    if (creationResult) {
      setResult(creationResult);
      console.log("이미지 ID 등록 성공:", creationResult);
      // 파일 업로드 창 열기
      fileInputRef.current.click();
    } else {
      console.error("이미지 ID 등록 실패");
      setResult(null); // 실패 시 result를 null로 설정
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleFlavorChange = (event) => {
    setSelectedFlavor(event.target.value);
  };

  const handleShowFlavorInfo = () => {
    if (selectedFlavor) {
      const flavor = flavors.find((flavor) => flavor.id === selectedFlavor);
      if (flavor) {
        alert(`Flavor: ${flavor.name}\nCPU: ${flavor.vcpus}\nRAM: ${flavor.ram} MB\nDisk: ${flavor.disk} GB`);
      } else {
        alert('선택한 Flavor를 찾을 수 없습니다.');
      }
    } else {
      alert('Flavor를 선택하세요.');
    }
  };

  const handleCreateFlavor = async (flavorData) => {
    try {
      // Flavor 생성 API 호출 (axios 사용)
      const data = await axios.post(
        '/api/nova/flavors',
        {
          flavor: {
            name: flavorData.name,
            ram: flavorData.ram,
            vcpus: flavorData.vcpus,
            disk: flavorData.disk,
            'os-flavor-access:is_public': true,
          },
        },
        {
          headers: {
            'X-Auth-Token': token,
            'Content-Type': 'application/json',
          },
        }
      );

      // Flavor 생성 성공 처리
      console.log('Flavor 생성 성공:', data);
      alert('Flavor가 성공적으로 생성되었습니다.');

      fetchFlavors();
    } catch (error) {
      console.error('Flavor 생성 실패:', error);
      alert('Flavor 생성에 실패했습니다.');
    }
  };
  
  return (
    <div>
        <h1>대시보드</h1>
        <button onClick={handleLogout}>로그아웃</button>
        <h2>자원 현황</h2>
          <div>
            VCPUs : { compute.totalCoresUsed + '/' + compute.maxTotalCores }
          </div>
          <div>
            RAM: {ramInGB(compute.totalRAMUsed)} GB / {ramInGB(compute.maxTotalRAMSize)} GB
          </div>
          <div>
            인스턴스: {compute.totalInstancesUsed} / {compute.maxTotalInstances}
          </div>
          <h2>Flavor 목록</h2>
            <select value={selectedFlavor} onChange={handleFlavorChange}>
              <option value="">Flavor를 선택하세요</option>
              {flavors.map((flavors) => (
                <option key={flavors.id} value={flavors.id}>
                  {flavors.name}
                </option>
              ))}
            </select>
            <button onClick={handleShowFlavorInfo}>정보 조회</button>
          <FlavorForm compute={compute} onCreate={handleCreateFlavor} />
        <h2>QCOW2 이미지 등록</h2>
          <div>
            <input
                type="text"
                value={imageName}
                onChange={(e) => setImageName(e.target.value)}
                placeholder="image 이름을 입력하세요"
            />
            <button onClick={handleImageCreation}>IMG 이미지 생성</button>
            <input
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
              ref={fileInputRef}
            />
          </div>
        <h2>가상 머신 목록</h2>
        <div>
          <label htmlFor="vmName">VM 이름:</label>
          <input
            type="text"
            id="vmName"
            value={vmName}
            onChange={(e) => setVmName(e.target.value)}
            placeholder="VM 이름을 입력하세요"
          />
        </div>
        <div>
          <label htmlFor="flavor">Flavor:</label>
          <select id="flavor" value={vmSelectedFlavor} onChange={(e) => setVmSelectedFlavor(e.target.value)}>
            <option value="">Flavor를 선택하세요</option>
            {flavors.map((flavor) => (
              <option key={flavor.id} value={flavor.id}>
                {flavor.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="image">이미지:</label>
          <select id="image" value={vmSelectedImage} onChange={(e) => setVmSelectedImage(e.target.value)}>
            <option value="">이미지를 선택하세요</option>
            {images.map((image) => (
              <option key={image.id} value={image.id}>
                {image.name}
              </option>
            ))}
          </select>
          <div>
            <label htmlFor="username">ID:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ID를 입력하세요"
            />
          </div>
          <div>
            <label htmlFor="password">비밀번호:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
            />
          </div>

        <button onClick={() => handleCreateVM(vmName, vmSelectedFlavor, vmSelectedImage, username, password)}>가상 머신 생성</button>
        </div>
        <table>
            <thead>
                <tr>
                    <th>이름</th>
                    <th>ID</th>
                    <th>상태</th>
                    <th>작업</th>
                </tr>
            </thead>
            <tbody>
                {servers.map((server) => (
                    <tr key={server.id}>
                    <td>{server.name}</td>
                    <td>{server.id}</td>
                    <td>{server.status}</td>
                    <td>
                      <button onClick={() => handleStartVM(server.id)}>시작</button>
                      <button onClick={() => handleStopVM(server.id)}>중지</button>
                      <button onClick={() => handleDeleteVM(server.id)}>삭제</button>
                      {server.status === 'ACTIVE' ? (
                        <button onClick={() => handleVNCConsole(server.id)}>접속</button>
                      ) : (
                        <></>
                      )}
                    </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
}

export default Dashboard;