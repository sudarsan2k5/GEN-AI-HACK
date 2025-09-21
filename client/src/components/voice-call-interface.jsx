import { useAppStore } from "@/store";
import { Mic, MicOff, Volume2, VolumeX, PhoneOff, Settings } from "lucide-react";
import { useState } from "react";
import { getWebRTCManager } from "@/utils/WebRTCManager";

const VoiceCallInterface = () => {
  const {
    currentVoiceChannel,
    isInVoiceCall,
    isMuted,
    isDeafened,
    voiceUsers,
    setIsMuted,
    setIsDeafened,
    leaveVoiceChannel,
  } = useAppStore();

  const [isMinimized, setIsMinimized] = useState(false);

  if (!isInVoiceCall || !currentVoiceChannel) {
    return null;
  }

  const handleToggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    // Update WebRTC manager
    const webRTCManager = getWebRTCManager();
    if (webRTCManager) {
      webRTCManager.muteMicrophone(newMutedState);
    }
    
    // Emit socket event to update voice state
    if (window.socket) {
      window.socket.emit('voice-state-update', {
        channelId: currentVoiceChannel._id,
        muted: newMutedState,
        deafened: isDeafened
      });
    }
  };

  const handleToggleDeafen = () => {
    const newDeafenedState = !isDeafened;
    setIsDeafened(newDeafenedState);
    
    // If deafening, also mute
    if (newDeafenedState) {
      setIsMuted(true);
      const webRTCManager = getWebRTCManager();
      if (webRTCManager) {
        webRTCManager.muteMicrophone(true);
      }
    }
    
    // Emit socket event to update voice state
    if (window.socket) {
      window.socket.emit('voice-state-update', {
        channelId: currentVoiceChannel._id,
        muted: newDeafenedState ? true : isMuted,
        deafened: newDeafenedState
      });
    }
  };

  const handleLeaveCall = () => {
    // Clean up WebRTC connections
    const webRTCManager = getWebRTCManager();
    if (webRTCManager) {
      webRTCManager.cleanup();
    }
    
    leaveVoiceChannel();
    
    // Emit socket event to leave voice channel
    if (window.socket) {
      window.socket.emit('leave-voice-channel', {
        channelId: currentVoiceChannel._id
      });
    }
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-[#1b1c24] border-t border-[#2f303b] z-50 transition-all duration-300 ${
      isMinimized ? 'h-16' : 'h-24'
    }`}>
      <div className="flex items-center justify-between px-4 h-full">
        {/* Voice Channel Info */}
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <div>
            <div className="text-white font-medium text-sm">
              {currentVoiceChannel.name}
            </div>
            <div className="text-gray-400 text-xs">
              {voiceUsers.length} participant{voiceUsers.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Connected Users */}
        {!isMinimized && (
          <div className="flex items-center gap-2 flex-1 justify-center max-w-md">
            <div className="flex -space-x-2">
              {voiceUsers.slice(0, 6).map((user, index) => (
                <div
                  key={user.userId?._id || index}
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center text-white text-xs border-2 border-[#1b1c24] ${
                    user.muted ? 'bg-red-500' : 'bg-[#8338ec]'
                  }`}
                  title={`${user.userId?.firstName || 'User'} ${user.muted ? '(Muted)' : ''}`}
                >
                  {user.userId?.firstName?.charAt(0) || '?'}
                  {user.muted && (
                    <MicOff size={10} className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-0.5" />
                  )}
                </div>
              ))}
              {voiceUsers.length > 6 && (
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs border-2 border-[#1b1c24]">
                  +{voiceUsers.length - 6}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Voice Controls */}
        <div className="flex items-center gap-2">
          {/* Minimize/Maximize */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 rounded-full bg-[#2f303b] hover:bg-[#404154] text-gray-400 hover:text-white transition-all duration-200"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? '↑' : '↓'}
          </button>

          {/* Mute Button */}
          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-full transition-all duration-200 ${
              isMuted || isDeafened
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-[#2f303b] hover:bg-[#404154] text-gray-400 hover:text-white'
            }`}
            title={isMuted || isDeafened ? 'Unmute' : 'Mute'}
          >
            {isMuted || isDeafened ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          {/* Deafen Button */}
          <button
            onClick={handleToggleDeafen}
            className={`p-2 rounded-full transition-all duration-200 ${
              isDeafened
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-[#2f303b] hover:bg-[#404154] text-gray-400 hover:text-white'
            }`}
            title={isDeafened ? 'Undeafen' : 'Deafen'}
          >
            {isDeafened ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Settings Button */}
          <button
            className="p-2 rounded-full bg-[#2f303b] hover:bg-[#404154] text-gray-400 hover:text-white transition-all duration-200"
            title="Voice Settings"
          >
            <Settings size={16} />
          </button>

          {/* Leave Call Button */}
          <button
            onClick={handleLeaveCall}
            className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200"
            title="Leave Voice Channel"
          >
            <PhoneOff size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceCallInterface;
