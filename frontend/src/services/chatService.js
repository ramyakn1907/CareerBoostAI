import API from "./api";

export const sendChatMessage = async (message, conversationId = null) => {
  try {
    const response = await API.post("/chat/messages", {
      message,
      conversation_id: conversationId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      detail: "Failed to send message to AI Career Coach.",
    };
  }
};

export const getConversations = async () => {
  try {
    const response = await API.get("/chat/conversations");
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      detail: "Failed to fetch conversations.",
    };
  }
};

export const deleteConversation = async (conversationId) => {
  try {
    const response = await API.delete(`/chat/conversations/${conversationId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      detail: "Failed to delete conversation.",
    };
  }
};