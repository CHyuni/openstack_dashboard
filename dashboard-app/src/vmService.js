import axios from 'axios';

const vmService = {
  // VM 목록 가져오기
  async fetchServers(token) {
    const response = await axios.get('/api/nova/servers', {
      headers: { 'X-Auth-Token': token },
    });
    return response.data;
  },

  async fetchCompute(token) {
    const response = await axios.get('/api/nova/compute', {
      headers: { 'X-Auth-Token': token },
    })
    return response.data;
  },

  // VM 생성
  async createVM(token, vmData) {
    const response = await axios.post('/api/nova/servers', { server: vmData }, {
      headers: { 'X-Auth-Token': token },
    });
    console.log(response)
  },

  // VM 삭제
  async deleteVM(token, serverId) {
    await axios.delete(`/api/nova/servers/${serverId}`, {
      headers: { 'X-Auth-Token': token },
    });
  },

  // VM 시작
  async startVM(token, serverId) {
    await axios.post(`/api/nova/servers/${serverId}/action`, { action: 'start' }, {
      headers: { 'X-Auth-Token': token },
    });
  },

  // VM 중지
  async stopVM(token, serverId) {
    await axios.post(`/api/nova/servers/${serverId}/action`, { action: 'stop' }, {
      headers: { 'X-Auth-Token': token },
    });
  },

  async getVNCConsole(token, serverId) {
    const response = await axios.get(`/api/nova/servers/${serverId}/vnc`, {
      headers: { 'X-Auth-Token': token },
    });
    return response.data;
  },
};

export default vmService;