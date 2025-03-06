import { useCallback } from 'react';
import vmService from './vmService';

const useVmActions = (token, fetchServers) => {
  const handleCreateVM = async (vmName, vmSelectedFlavor, vmSelectedImage, username, password) => {
    try {
      // 유효성 검사
      if (!vmName || !vmSelectedFlavor || !vmSelectedImage || !username || !password) {
        alert('VM 이름, Flavor, 이미지, ID, 비밀번호를 모두 선택하세요.');
        return;
      }
  
      const userData = `
#cloud-config
users:
  - name: ${username}
    sudo: ALL=(ALL) NOPASSWD:ALL
    plain_text_passwd: ${password}
    lock_passwd: false
`;

      const vmData = {
        name: vmName || `new-vm-${Date.now()}`,
        imageRef: vmSelectedImage,
        flavorRef: vmSelectedFlavor,
        user_data: btoa(userData),
      };

      // 가상 머신 생성 API 호출
      await vmService.createVM(token, vmData);
      fetchServers();
    } catch (error) {
      console.error('가상 머신 생성 실패:', error);
      alert('가상 머신 생성에 실패했습니다.');
    }
  };

  const handleDeleteVM = useCallback(
    async (serverId) => {
      if (window.confirm('정말로 삭제하시겠습니까?')) {
        try {
          await vmService.deleteVM(token, serverId);
          fetchServers();
        } catch (error) {
          console.error('VM 삭제 실패:', error);
          alert('VM 삭제에 실패했습니다.');
        }
      }
    },
    [token, fetchServers]
  );

  const handleStartVM = useCallback(
    async (serverId) => {
      try {
        await vmService.startVM(token, serverId);
        fetchServers();
      } catch (error) {
        console.error('VM 시작 실패:', error);
        alert('VM 시작에 실패했습니다.');
      }
    },
    [token, fetchServers]
  );

  const handleStopVM = useCallback(
    async (serverId) => {
      try {
        await vmService.stopVM(token, serverId);
        fetchServers();
      } catch (error) {
        console.error('VM 중지 실패:', error);
        alert('VM 중지에 실패했습니다.');
      }
    },
    [token, fetchServers]
  );

  const handleVNCConsole = useCallback(async (serverId) => {
    try {
      const data = await vmService.getVNCConsole(token, serverId);
      const vncUrl = data.console.url;

      window.open(vncUrl, '_blank');
    } catch (error) {
      console.error('VNC 콘솔 URL 가져오기 실패:', error);
      alert('VNC 콘솔 URL을 가져오는 데 실패했습니다.');
    }
  }, [token]);

  return { handleCreateVM, handleDeleteVM, handleStartVM, handleStopVM, handleVNCConsole };
};

export default useVmActions;