import React, { useState } from 'react';

function FlavorForm({ compute, onCreate }) {
  const [flavorName, setFlavorName] = useState('');
  const [vcpuCount, setVcpuCount] = useState('');
  const [ramSize, setRamSize] = useState('');
  const [diskSize, setDiskSize] = useState('5');

  const handleSubmit = (e) => {
    e.preventDefault(); // 폼 기본 제출 동작 방지

    if (!flavorName || !vcpuCount || !ramSize) {
      alert('모든 필드를 입력하세요.');
      return;
    }

    // 숫자 값으로 변환
    const vcpus = parseInt(vcpuCount, 10);
    const ram = parseInt(ramSize, 10);
    const disk = parseInt(diskSize, 10);

    // 유효성 검사
    if (vcpus > compute.maxTotalCores) {
      alert(`VCPU는 최대 ${compute.maxTotalCores}개까지 생성할 수 있습니다.`);
      return;
    }
    if (ram > compute.maxTotalRAMSize) {
      alert(`RAM은 최대 ${compute.maxTotalRAMSize} MB까지 생성할 수 있습니다.`);
      return;
    }
    if (disk > 5) {
      alert('디스크 크기는 최대 5GB까지 생성할 수 있습니다.');
      return;
    }

    // onCreate 함수 호출하여 Flavor 생성 요청 처리
    onCreate({
      name: flavorName,
      vcpus: vcpus,
      ram: ram,
      disk: disk,
    });

    // 입력 필드 초기화
    setFlavorName('');
    setVcpuCount('');
    setRamSize('');
    setDiskSize('5');
  };

  return (
    <div>
      <h2>새로운 Flavor 생성</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="flavorName">Flavor 이름:</label>
          <input
            type="text"
            id="flavorName"
            value={flavorName}
            onChange={(e) => setFlavorName(e.target.value)}
            placeholder="Flavor 이름을 입력하세요"
          />
        </div>
        <div>
          <label htmlFor="vcpuCount">VCPU:</label>
          <input
            type="number"
            id="vcpuCount"
            value={vcpuCount}
            onChange={(e) => setVcpuCount(e.target.value)}
            placeholder={`VCPU (최대 ${compute.maxTotalCores})`}
            min="1"
            max={compute.maxTotalCores}
            style={{ width: '150px' }}
          />
        </div>
        <div>
          <label htmlFor="ramSize">RAM (MB):</label>
          <input
            type="number"
            id="ramSize"
            value={ramSize}
            onChange={(e) => setRamSize(e.target.value)}
            placeholder={`RAM (최대 ${compute.maxTotalRAMSize} MB)`}
            min="1"
            max={compute.maxTotalRAMSize}
            style={{ width: '150px' }}
          />
        </div>
        <div>
          <label htmlFor="diskSize">Disk (GB):</label>
          <input
            type="number"
            id="diskSize"
            value={diskSize}
            onChange={(e) => setDiskSize(e.target.value)}
            placeholder="Disk (최대 5 GB)"
            min="1"
            max="5"
            readOnly
          />
        </div>
        <button type="submit">Flavor 생성</button>
      </form>
    </div>
  );
}

export default FlavorForm;