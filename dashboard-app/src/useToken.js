import { useState } from 'react';

export const useToken = () => {
  const getToken = () => {
    const tokenString = localStorage.getItem('authToken');
    const userToken = JSON.parse(tokenString);
    return userToken?.token
  };

  const getProjectId = () => {
    const tokenString = localStorage.getItem('authToken');
    const userToken = JSON.parse(tokenString);
    return userToken?.project_id;
  };

  const [token, setToken] = useState(getToken());
  const [projectId, setProjectId] = useState(getProjectId());

  const saveToken = userToken => {
    localStorage.setItem('authToken', JSON.stringify(userToken));
    setToken(userToken.token);
    setProjectId(userToken.project_id);
  };

  const removeToken = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setProjectId(null);
  }

  return {
    setToken: saveToken,
    token,
    projectId,
    removeToken
  }
}
