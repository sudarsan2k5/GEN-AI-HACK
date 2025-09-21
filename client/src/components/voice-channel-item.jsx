import { useAppStore } from "@/store";
import { apiClient } from "@/lib/api-client";
import { JOIN_VOICE_CHANNEL_ROUTE, LEAVE_VOICE_CHANNEL_ROUTE } from "@/utils/constants";
import { Volume2, VolumeX, Users, Phone, PhoneOff, Lock, Globe } from "lucide-react";
import { getWebRTCManager } from "@/utils/WebRTCManager";

const VoiceChannelItem = ({ voiceChannel }) => {
  const {
    currentVoiceChannel,
    isInVoiceCall,
    userInfo,
    joinVoiceChannel,
    leaveVoiceChannel,
    setVoiceUsers,
  } = useAppStore();

  const isConnected = currentVoiceChannel?._id === voiceChannel._id;
  const userCount = voiceChannel.connectedUsers?.length || 0;

  const handleJoinVoiceChannel = async () => {
    try {
      // Initialize WebRTC manager and get media
      const webRTCManager = getWebRTCManager();
      if (webRTCManager) {
        await webRTCManager.initializeMedia();
      }

      // Join voice channel via API
      const response = await apiClient.post(
        `${JOIN_VOICE_CHANNEL_ROUTE}/${voiceChannel._id}`,
        { socketId: window.socket?.id || 'temp-socket-id' },
        { withCredentials: true }
      );

      if (response.data.voiceChannel) {
        joinVoiceChannel(voiceChannel);
        setVoiceUsers(response.data.voiceChannel.connectedUsers);
        
        // Emit socket event to join voice room
        if (window.socket) {
          window.socket.emit('join-voice-channel', { channelId: voiceChannel._id });
        }
      }
    } catch (error) {
      console.error('Failed to join voice channel:', error);
      if (error.name === 'NotAllowedError') {
        alert('Microphone permission is required to join voice channels');
      } else {
        alert('Failed to join voice channel: ' + error.message);
      }
    }
  };

  const handleLeaveVoiceChannel = async () => {
    try {
      // Clean up WebRTC connections
      const webRTCManager = getWebRTCManager();
      if (webRTCManager) {
        webRTCManager.cleanup();
      }

      await apiClient.post(
        `${LEAVE_VOICE_CHANNEL_ROUTE}/${voiceChannel._id}`,
        {},
        { withCredentials: true }
      );

      leaveVoiceChannel();
      
      // Emit socket event to leave voice room
      if (window.socket) {
        window.socket.emit('leave-voice-channel', { channelId: voiceChannel._id });
      }
    } catch (error) {
      console.error('Failed to leave voice channel:', error);
    }
  };

  return (
    <div 
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#2f303b] ${
        isConnected ? 'bg-[#8338ec]/20 border border-[#8338ec]/30' : 'hover:bg-[#2f303b]'
      }`}
    >
      {/* Voice Channel Icon */}
      <div className={`text-xl ${isConnected ? 'text-[#8338ec]' : 'text-gray-400'}`}>
        {isConnected ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </div>

      {/* Channel Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">{voiceChannel.name}</span>
          {voiceChannel.isPublic === false && (
            <Lock size={12} className="text-gray-400" title="Private Channel" />
          )}
          {voiceChannel.isPublic !== false && (
            <Globe size={12} className="text-gray-400" title="Public Channel" />
          )}
        </div>
        <div className="text-gray-400 text-sm flex items-center gap-1">
          <Users size={12} />
          {userCount}/{voiceChannel.maxUsers}
        </div>
      </div>

      {/* Connected Users Preview */}
      {userCount > 0 && (
        <div className="flex -space-x-2">
          {voiceChannel.connectedUsers?.slice(0, 3).map((user, index) => (
            <div
              key={user.userId._id || index}
              className="w-6 h-6 rounded-full bg-[#8338ec] flex items-center justify-center text-white text-xs border-2 border-[#1b1c24]"
              title={user.userId.firstName || 'User'}
            >
              {user.userId.firstName?.charAt(0) || '?'}
            </div>
          ))}
          {userCount > 3 && (
            <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs border-2 border-[#1b1c24]">
              +{userCount - 3}
            </div>
          )}
        </div>
      )}

      {/* Join/Leave Button */}
      <button
        onClick={isConnected ? handleLeaveVoiceChannel : handleJoinVoiceChannel}
        className={`p-2 rounded-full transition-all duration-200 ${
          isConnected 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-[#8338ec] hover:bg-[#7530d6] text-white'
        }`}
        title={isConnected ? 'Leave Voice Channel' : 'Join Voice Channel'}
      >
        {isConnected ? <PhoneOff size={16} /> : <Phone size={16} />}
      </button>
    </div>
  );
};

export default VoiceChannelItem;
