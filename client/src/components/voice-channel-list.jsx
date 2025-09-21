import VoiceChannelItem from "./voice-channel-item";

const VoiceChannelList = ({ voiceChannels }) => {
  if (!voiceChannels || voiceChannels.length === 0) {
    return (
      <div className="text-gray-400 text-sm text-center py-4">
        No voice channels available
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-1">
      {voiceChannels.map((voiceChannel) => (
        <VoiceChannelItem 
          key={voiceChannel._id} 
          voiceChannel={voiceChannel} 
        />
      ))}
    </div>
  );
};

export default VoiceChannelList;
