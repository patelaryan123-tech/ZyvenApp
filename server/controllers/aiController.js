const AIConversation = require('../models/AIConversation');
const aiService = require('../services/aiService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const chat = async (req, res) => {
  try {
    const { message, conversationId, language } = req.body;
    
    let conversation;
    if (conversationId) {
      conversation = await AIConversation.findOne({ _id: conversationId, userId: req.user.id });
      if (!conversation) return errorResponse(res, 'Conversation not found', 404);
    } else {
      conversation = await AIConversation.create({
        userId: req.user.id,
        language: language || 'en',
        title: message.substring(0, 30) + '...',
        messages: []
      });
    }

    conversation.messages.push({ role: 'user', content: message });
    
    const aiResponse = await aiService.chatWithAI(message, conversation.messages, conversation.language);
    
    conversation.messages.push({ role: 'assistant', content: aiResponse });
    await conversation.save();

    return successResponse(res, 'Response generated', {
      conversationId: conversation._id,
      response: aiResponse
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getConversations = async (req, res) => {
  try {
    const conversations = await AIConversation.find({ userId: req.user.id })
      .select('-messages')
      .sort({ updatedAt: -1 });
    return successResponse(res, 'Conversations retrieved', conversations);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getConversationById = async (req, res) => {
  try {
    const conversation = await AIConversation.findOne({ _id: req.params.id, userId: req.user.id });
    if (!conversation) return errorResponse(res, 'Conversation not found', 404);
    return successResponse(res, 'Conversation retrieved', conversation);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const deleteConversation = async (req, res) => {
  try {
    const conversation = await AIConversation.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!conversation) return errorResponse(res, 'Conversation not found', 404);
    return successResponse(res, 'Conversation deleted');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  chat,
  getConversations,
  getConversationById,
  deleteConversation
};
