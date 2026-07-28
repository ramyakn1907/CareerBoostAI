import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const sendChatMessage = async (message, conversationId = null) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/chat/messages`,
      { message, conversation_id: conversationId },
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Failed to send message to AI Career Coach.' };
  }
};

export const getConversations = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/chat/conversations`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Failed to fetch conversations.' };
  }
};

export const deleteConversation = async (conversationId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/chat/conversations/${conversationId}`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Failed to delete conversation.' };
  }
};
