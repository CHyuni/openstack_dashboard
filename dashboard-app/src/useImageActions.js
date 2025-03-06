import { useCallback } from 'react';
import axios from 'axios';

const useImageActions = (token) => {
    const handleCreateImage = useCallback(async (imageName) => {
      try {
        const response = await axios.post('/api/glance/images', {
            name: imageName,
            disk_format: 'qcow2',
            container_format: 'bare',
            visibility: 'public',
        }, {
            headers: { 'X-Auth-Token': token,
            'Content-Type': 'application/json'  },
        });

        return response.data.id;
  
      } catch (error) {
        console.error("이미지ID등록 실패", error);
      }
    }, [token]);
  
    const handleUploadImage = useCallback(async (imageId, file) => {
        if (!file || !(file instanceof File)) {
            console.error('Invalid file object:', file);
            return false;
        }

        const formData = new FormData();
        formData.append('image', file);
        try {
          const response = await axios.put(`/api/glance/images/${imageId}/file`, formData, {
            headers: {
              'X-Auth-Token': token,
            }
          });
    
          return response.status === 204; // 성공 여부 반환 (204 No Content)
    
        } catch (error) {
          console.error("이미지 파일 업로드 실패", error);
          return false;
        }
    }, [token]);

    return { handleCreateImage, handleUploadImage };
  };
  
  export default useImageActions;