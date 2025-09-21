import { Router } from 'express';
import { sendMessage, getChatHistory, clearChatHistory } from '../controllers/AIChatController.js';
import { verifyToken } from '../middlewares/AuthMiddleware.js';

const aiChatRoutes = Router();

// Send message to AI mental health assistant
aiChatRoutes.post('/ai-chat/message', verifyToken, sendMessage);

// Get chat history for a user
aiChatRoutes.get('/ai-chat/history', verifyToken, getChatHistory);

// Clear chat history for a user
aiChatRoutes.delete('/ai-chat/history', verifyToken, clearChatHistory);

export default aiChatRoutes;
