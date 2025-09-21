import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: "OPENAI_API_KEY"
});

// Mental health conversation history (in production, this should be stored in database)
const conversationHistory = new Map();

const MENTAL_HEALTH_SYSTEM_PROMPT = `You are a compassionate mental health support AI assistant. Your role is to provide emotional support, guidance, and resources to users who may be experiencing depression, anxiety, stress, or other mental health challenges.

Guidelines:
- Always respond with empathy, understanding, and without judgment
- Provide practical coping strategies and techniques
- Suggest professional help when appropriate (therapists, counselors, hotlines)
- Never diagnose or provide medical advice
- Encourage self-care and positive habits
- Be supportive but also recognize the limits of AI assistance
- If someone expresses suicidal thoughts, provide crisis resources immediately
- Use a warm, caring, and professional tone
- Ask follow-up questions to better understand their situation
- Provide actionable advice and suggestions

Crisis Resources:
- National Suicide Prevention Lifeline: 988 (US)
- Crisis Text Line: Text HOME to 741741
- International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/

Remember: You are here to support, not replace professional mental health services.`;

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create conversation history for this user
    if (!conversationHistory.has(userId)) {
      conversationHistory.set(userId, [
        { role: 'system', content: MENTAL_HEALTH_SYSTEM_PROMPT }
      ]);
    }

    const userConversation = conversationHistory.get(userId);
    
    // Add user message to conversation
    userConversation.push({ role: 'user', content: message });

    // Keep conversation history manageable (last 20 messages + system prompt)
    if (userConversation.length > 21) {
      userConversation.splice(1, userConversation.length - 21);
    }

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: userConversation,
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiMessage = response.choices[0].message.content;

    // Add AI response to conversation history
    userConversation.push({ role: 'assistant', content: aiMessage });

    res.json({
      success: true,
      message: aiMessage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ 
      error: 'Failed to get AI response',
      details: error.message 
    });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ error: 'UserId is required' });
    }

    const userConversation = conversationHistory.get(userId) || [];
    
    // Filter out system messages and return only user/assistant messages
    const chatHistory = userConversation
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date().toISOString()
      }));

    res.json({
      success: true,
      history: chatHistory
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ 
      error: 'Failed to get chat history',
      details: error.message 
    });
  }
};

const clearChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ error: 'UserId is required' });
    }

    // Reset conversation to just the system prompt
    conversationHistory.set(userId, [
      { role: 'system', content: MENTAL_HEALTH_SYSTEM_PROMPT }
    ]);

    res.json({
      success: true,
      message: 'Chat history cleared'
    });

  } catch (error) {
    console.error('Clear chat history error:', error);
    res.status(500).json({ 
      error: 'Failed to clear chat history',
      details: error.message 
    });
  }
};

export {
  sendMessage,
  getChatHistory,
  clearChatHistory
};
