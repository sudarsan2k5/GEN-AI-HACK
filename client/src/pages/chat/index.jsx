import { useAppStore } from "@/store"
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ContactsContainer from "./components/contacts-container";
import EmptyChatContainer from "./components/empty-chat-container";
import ChatContainer from "./components/chat-container";
import VoiceCallInterface from "@/components/voice-call-interface";
import AiChat from "@/components/ai-chat";
import SocialMediaFeed from "@/components/social-media-feed";



const Chat = () => {

  const {userInfo,selectedChatType,isUploading,
    isDownloading,
    fileUploadProgress,
    fileDownloadProgress,} =useAppStore();
  const navigate= useNavigate();
  useEffect(()=>{
    if(!userInfo.profileSetup){
      toast("Please Setup profile to continue.");
      navigate("/profile");
    }
  },[userInfo,navigate]);
  return (
    <div className="flex h-[100vh] text-white overflow-hidden">
      {isUploading && (<div className="h-[100vh] w-[100vw] fixed top-0 z-10 left-0 bg-black/80 flex items-center justify-center flex-col gap-5 backdrop-blur-lg">
          <h5 className="text-5xl animate-pulse ">Uploading File</h5>
          {fileUploadProgress}%
        </div>
      )}
      {isDownloading && (<div className="h-[100vh] w-[100vw] fixed top-0 z-10 left-0 bg-black/80 flex items-center justify-center flex-col gap-5 backdrop-blur-lg">
          <h5 className="text-5xl animate-pulse ">Downloading File</h5>
          {fileDownloadProgress}%
        </div>
      )}
      <ContactsContainer/>
      {
        selectedChatType === undefined ? ( 
          <EmptyChatContainer/> 
        ) : selectedChatType === "ai-chat" ? (
          <div className="flex-1 bg-[#1c1d25] flex flex-col h-[100vh]">
            <AiChat/>
          </div>
        ) : selectedChatType === "social-media" ? (
          <div className="flex-1 bg-[#1c1d25] flex flex-col h-[100vh]">
            <SocialMediaFeed/>
          </div>
        ) : (
          <ChatContainer/>
        )
      }
      <VoiceCallInterface />
    </div>
  )
}

export default Chat