import { Heading6 } from "lucide-react";
import ProfileInfo from "./components/profile-info";
import NewDM from "./components/new-dm";
import { useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { GET_DM_CONTACTS_ROUTES, GET_USER_CHANNEL_ROUTE, GET_USER_VOICE_CHANNELS_ROUTE } from "@/utils/constants";
import { useAppStore } from "@/store";
import ContactList from "@/components/contact-list";
import CreateChannel from "../create-channel";
import CreateVoiceChannel from "../create-voice-channel";
import VoiceChannelList from "@/components/voice-channel-list";
import { Brain, Share2 } from "lucide-react";


const ContactsContainer = () => {

  const {setDirectMessagesContacts,directMessagesContacts,channels,setChannels,voiceChannels,setVoiceChannels,setSelectedChatType,setSelectedChatData,selectedChatType} = useAppStore();

  useEffect(()=>{
    const getContacts = async () => {
      const response = await apiClient.get(GET_DM_CONTACTS_ROUTES,{withCredentials:true});
      if(response.data.contacts){
        setDirectMessagesContacts(response.data.contacts);
      }
    };

    const getChannels = async () => {
  try {
    const response = await apiClient.get(GET_USER_CHANNEL_ROUTE, { withCredentials: true });
    
    if (response.data.channels) {
      // Fetch details of each channel to get the channel name
      const detailedChannels = await Promise.all(
        response.data.channels.map(async (channelId) => {
          const response = await apiClient.get(`/channel/${channelId}`, { withCredentials: true });
          return response.data.channel.name;  // Assuming channel object has a 'name' property
        })
      );
      
      setChannels(detailedChannels); // Now contains array of channel names instead of IDs
    }
  } catch (error) {
    console.error("Failed to get channels: ", error);
  }
};

    const getVoiceChannels = async () => {
      try {
        const response = await apiClient.get(GET_USER_VOICE_CHANNELS_ROUTE, { withCredentials: true });
        
        if (response.data.voiceChannels) {
          setVoiceChannels(response.data.voiceChannels);
        }
      } catch (error) {
        console.error("Failed to get voice channels: ", error);
      }
    };

    getContacts();
    getChannels();
    getVoiceChannels();
  },[setChannels,setDirectMessagesContacts,setVoiceChannels]);


  return (
    <div className="relative md:w-[35vw] lg:w-[30vw] xl:w-[20vw] bg-[#1b1c24] border-r-2 border-[#2f303b] w-full">
        <div className="pt-3">
            <Logo/>
        </div>
        <div className="my-5">
            <div className="flex items-center justify-between pr-10">
                <Title text="AI Mental Health Support"/>
            </div>
            <div className="max-h-[15vh] overflow-y-auto scrollbar-hidden">
              <AiChatButton/>
            </div>
        </div>
        <div className="my-5">
            <div className="flex items-center justify-between pr-10">
                <Title text="Social Media Feed"/>
            </div>
            <div className="max-h-[15vh] overflow-y-auto scrollbar-hidden">
              <SocialMediaButton/>
            </div>
        </div>
        <div className="my-5">
            <div className="flex items-center justify-between pr-10">
                <Title text="Voice Channels"/>
                 <CreateVoiceChannel/>
            </div>
            <div className="max-h-[25vh] overflow-y-auto scrollbar-hidden ">
              <VoiceChannelList voiceChannels={voiceChannels}/>
            </div>
        </div>
        <ProfileInfo/>
        </div>
  );
};



const Logo = () => {
  return (
    <div className="flex p-5  justify-start items-center gap-2">
      <svg
        id="logo-38"
        width="78"
        height="32"
        viewBox="0 0 78 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {" "}
        <path
          d="M55.5 0H77.5L58.5 32H36.5L55.5 0Z"
          className="ccustom"
          fill="#8338ec"
        ></path>{" "}
        <path
          d="M35.5 0H51.5L32.5 32H16.5L35.5 0Z"
          className="ccompli1"
          fill="#975aed"
        ></path>{" "}
        <path
          d="M19.5 0H31.5L12.5 32H0.5L19.5 0Z"
          className="ccompli2"
          fill="#a16ee8"
        ></path>{" "}
      </svg>
      <span className="text-3xl font-semibold ">SoulSync</span>
    </div>
  );
};
export default ContactsContainer;

const Title = ({ text }) => {
  return (
    <h6 className="uppercase tracking-widest text-neutral-400 pl-10 font-light text-opacity-90 text-sm">
      {text}
    </h6>
  );
};

const AiChatButton = () => {
  const {setSelectedChatType,setSelectedChatData,selectedChatType} = useAppStore();
  
  const handleAiChatClick = () => {
    setSelectedChatType("ai-chat");
    setSelectedChatData({ name: "AI Mental Health Assistant", type: "ai-chat" });
  };

  const isSelected = selectedChatType === "ai-chat";

  return (
    <div 
      className={`pl-10 py-3 cursor-pointer transition-all duration-300 ${
        isSelected 
          ? 'bg-[#8417ff] text-white' 
          : 'hover:bg-[#2a2b33] text-neutral-400 hover:text-white'
      }`}
      onClick={handleAiChatClick}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isSelected 
            ? 'bg-white text-[#8417ff]' 
            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
        }`}>
          <Brain className="w-4 h-4" />
        </div>
        <div>
          <div className="text-sm font-medium">AI Mental Health Assistant</div>
          <div className="text-xs opacity-70">Get mental health support</div>
        </div>
      </div>
    </div>
  );
};

const SocialMediaButton = () => {
  const {setSelectedChatType,setSelectedChatData,selectedChatType} = useAppStore();
  
  const handleSocialMediaClick = () => {
    setSelectedChatType("social-media");
    setSelectedChatData({ name: "Social Media Feed", type: "social-media" });
  };

  const isSelected = selectedChatType === "social-media";

  return (
    <div 
      className={`pl-10 py-3 cursor-pointer transition-all duration-300 ${
        isSelected 
          ? 'bg-[#8417ff] text-white' 
          : 'hover:bg-[#2a2b33] text-neutral-400 hover:text-white'
      }`}
      onClick={handleSocialMediaClick}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isSelected 
            ? 'bg-white text-[#8417ff]' 
            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
        }`}>
          <Share2 className="w-4 h-4" />
        </div>
        <div>
          <div className="text-sm font-medium">Community Posts</div>
          <div className="text-xs opacity-70">Share your thoughts with everyone</div>
        </div>
      </div>
    </div>
  );
};
