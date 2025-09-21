import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { createContext,useContext,useEffect,useRef } from "react";
import { io } from "socket.io-client";
import { initializeWebRTC } from "@/utils/WebRTCManager";



const SocketContext = createContext(null);

export const useSocket = () =>{
    return useContext(SocketContext);
};

export const SocketProvider = ({children})=>{
    const socket = useRef();
    const {userInfo} = useAppStore();

    useEffect(()=>{
        if(userInfo){
            socket.current = io(HOST,{
                withCredentials:true,
                query:{userId:userInfo.id},
            });
            socket.current.on("connect",()=>{
                console.log("Connected to socket server");
                
                // Make socket available globally for voice components
                window.socket = socket.current;
                
                // Initialize WebRTC manager
                initializeWebRTC(socket.current, useAppStore);
            });


            const handleRecieveMessage =(message) =>{
                const {selectedChatData,selectedChatType,addMessage}=useAppStore.getState();

                if(selectedChatType!==undefined && (selectedChatData._id===message.sender._id || selectedChatData._id===message.recipient._id))
                {
                    console.log("message rcv",message);
                    addMessage(message);
                }
            };

            const handleNewPost = (post) => {
                const {addPost} = useAppStore.getState();
                addPost(post);
            };

            const handlePostUpdate = (updatedPost) => {
                const {updatePost} = useAppStore.getState();
                updatePost(updatedPost);
            };

            socket.current.on("receiveMessage",handleRecieveMessage);
            socket.current.on("new-post", handleNewPost);
            socket.current.on("post-updated", handlePostUpdate);

            return ()=>{
                if (window.webRTCManager) {
                    window.webRTCManager.cleanup();
                }
                socket.current.disconnect();
                window.socket = null;
            }
        }
    },[userInfo]);

    return (
        <SocketContext.Provider value={socket.current}>
            {children}
        </SocketContext.Provider>
    )
}