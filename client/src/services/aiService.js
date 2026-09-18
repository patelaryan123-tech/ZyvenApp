import api from './api';

export const aiService = {
  chat: async (message, conversationId = null) => {
    const response = await api.post('/ai/chat', { message, conversationId });
    return response.data;
  },
  getConversations: async () => {
    const response = await api.get('/ai/conversations');
    return response.data;
  },
  getConversationById: async (id) => {
    const response = await api.get(`/ai/conversations/${id}`);
    return response.data;
  },
  deleteConversation: async (id) => {
    const response = await api.delete(`/ai/conversations/${id}`);
    return response.data;
  }
};
