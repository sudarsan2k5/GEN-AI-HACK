import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/store";
import { apiClient } from "@/lib/api-client";
import { SEND_AI_MESSAGE_ROUTE, GET_AI_CHAT_HISTORY_ROUTE, CLEAR_AI_CHAT_HISTORY_ROUTE } from "@/utils/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Brain, Trash2, Heart } from "lucide-react";
import { toast } from "sonner";

const AiChat = () => {
  const { 
    userInfo, 
    aiChatMessages, 
    aiChatLoading, 
    setAiChatMessages, 
    setAiChatLoading, 
    addAiMessage, 
    clearAiChatMessages 
  } = useAppStore();
  
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiChatMessages]);

  useEffect(() => {
    // Load chat history when component mounts
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const response = await apiClient.get(
        GET_AI_CHAT_HISTORY_ROUTE,
        { withCredentials: true }
      );
      if (response.data.success) {
        setAiChatMessages(response.data.history);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      content: message,
      timestamp: new Date().toISOString()
    };

    // Add user message immediately
    addAiMessage(userMessage);
    setMessage("");
    setAiChatLoading(true);

    try {
      const response = await apiClient.post(
        SEND_AI_MESSAGE_ROUTE,
        { message: message },
        { withCredentials: true }
      );

      if (response.data.success) {
        const aiMessage = {
          role: "assistant",
          content: response.data.message,
          timestamp: response.data.timestamp
        };
        addAiMessage(aiMessage);
      } else {
        toast.error("Failed to get AI response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setAiChatLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      const response = await apiClient.delete(
        CLEAR_AI_CHAT_HISTORY_ROUTE,
        { withCredentials: true }
      );

      if (response.data.success) {
        clearAiChatMessages();
        toast.success("Chat history cleared");
      }
    } catch (error) {
      console.error("Error clearing history:", error);
      toast.error("Failed to clear history");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2f303b]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Mental Health Assistant</h3>
            <p className="text-sm text-neutral-400">Here to support your wellbeing</p>
          </div>
        </div>
        <Button
          onClick={clearHistory}
          variant="ghost"
          size="sm"
          className="text-neutral-400 hover:text-white"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {aiChatMessages.length === 0 ? (
          <div className="text-center text-neutral-400 mt-8">
            <Heart className="w-12 h-12 mx-auto mb-4 text-pink-400" />
            <h4 className="text-lg font-medium mb-2">Welcome to your Mental Health Assistant</h4>
            <p className="text-sm">
              I'm here to provide support, guidance, and resources for your mental wellbeing.
              Feel free to share what's on your mind.
            </p>
          </div>
        ) : (
          aiChatMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === "user"
                    ? "bg-[#8417ff] text-white"
                    : "bg-[#2a2b33] text-neutral-200 border border-[#2f303b]"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <span className="text-xs opacity-60 mt-1 block">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
        
        {aiChatLoading && (
          <div className="flex justify-start">
            <div className="bg-[#2a2b33] p-3 rounded-lg border border-[#2f303b]">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
                <span className="text-xs text-neutral-400">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#2f303b]">
        <div className="flex gap-3">
          <Input
            type="text"
            placeholder="Share what's on your mind..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-[#2a2b33] border-[#2f303b] text-white placeholder-neutral-400"
            disabled={aiChatLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!message.trim() || aiChatLoading}
            className="bg-[#8417ff] hover:bg-[#7c3aed]"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-neutral-500 mt-2 text-center">
          This AI assistant provides emotional support but is not a replacement for professional mental health care.
        </p>
      </div>
    </div>
  );
};

export default AiChat;
