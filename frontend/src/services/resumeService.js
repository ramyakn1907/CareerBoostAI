import API from './api';

export const analyzeResume = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await API.post('/resumes/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const getHistory = async () => {
  const res = await API.get('/resumes/history');
  return res.data;
};

export const getReport = async (id) => {
  const res = await API.get(`/resumes/history/${id}`);
  return res.data;
};

export const deleteReport = async (id) => {
  const res = await API.delete(`/resumes/history/${id}`);
  return res.data;
};
