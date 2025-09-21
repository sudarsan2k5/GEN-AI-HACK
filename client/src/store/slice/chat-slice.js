export const createChatSlice = (set,get) =>({
    selectedChatType:undefined,
    selectedChatData:undefined,
    selectedChatMessages:[],
    directMessagesContacts:[],
    isUploading:false,
    isDownloading:false,
    fileUploadProgress:0,
    fileDownloadProgress:0,
    channels:[],
    voiceChannels:[],
    currentVoiceChannel:null,
    voiceUsers:[],
    isInVoiceCall:false,
    isMuted:false,
    isDeafened:false,
    localStream:null,
    aiChatMessages:[],
    aiChatLoading:false,
    posts:[],
    postsLoading:false,
    setChannels:(channels)=>set({channels}),
    setVoiceChannels:(voiceChannels)=>set({voiceChannels}),
    setCurrentVoiceChannel:(currentVoiceChannel)=>set({currentVoiceChannel}),
    setVoiceUsers:(voiceUsers)=>set({voiceUsers}),
    setIsInVoiceCall:(isInVoiceCall)=>set({isInVoiceCall}),
    setIsMuted:(isMuted)=>set({isMuted}),
    setIsDeafened:(isDeafened)=>set({isDeafened}),
    setLocalStream:(localStream)=>set({localStream}),
    setAiChatMessages:(aiChatMessages)=>set({aiChatMessages}),
    setAiChatLoading:(aiChatLoading)=>set({aiChatLoading}),
    addAiMessage:(message)=>{
        const aiChatMessages = get().aiChatMessages;
        set({aiChatMessages:[...aiChatMessages,message]});
    },
    clearAiChatMessages:()=>set({aiChatMessages:[]}),
    setPosts:(posts)=>set({posts}),
    setPostsLoading:(postsLoading)=>set({postsLoading}),
    addPost:(post)=>{
        const posts = get().posts;
        set({posts:[post,...posts]});
    },
    updatePost:(updatedPost)=>{
        const posts = get().posts;
        const updatedPosts = posts.map(post => 
            post._id === updatedPost._id ? updatedPost : post
        );
        set({posts:updatedPosts});
    },
    removePost:(postId)=>{
        const posts = get().posts;
        set({posts:posts.filter(post => post._id !== postId)});
    },
    joinVoiceChannel:(channel)=>{
        set({currentVoiceChannel:channel,isInVoiceCall:true});
    },
    leaveVoiceChannel:()=>{
        set({currentVoiceChannel:null,isInVoiceCall:false,voiceUsers:[],localStream:null});
    },
    setIsUploading:(isUploading) => set({isUploading}),
    setIsDownloading:(isDownloading) => set({isDownloading}),
    setFileUploadProgress:(fileUploadProgress) => set({fileUploadProgress}),
    setFileDownloadProgress:(fileDownloadProgress) => set({fileDownloadProgress}),
    setSelectedChatType:(selectedChatType) => set({selectedChatType}),
    setSelectedChatData:(selectedChatData) => set({selectedChatData}),
    setSelectedChatMessages:(selectedChatMessages)=> set({selectedChatMessages}),
    setDirectMessagesContacts:(directMessagesContacts)=> set({directMessagesContacts}),
    addChannel:(channel)=>{
        const channels = get().channels;
        set({channels:[channel,...channels]});
    },
    addVoiceChannel:(voiceChannel)=>{
        const voiceChannels = get().voiceChannels;
        set({voiceChannels:[voiceChannel,...voiceChannels]});
    },
    updateVoiceUser:(userId,updates)=>{
        const voiceUsers = get().voiceUsers;
        const updatedUsers = voiceUsers.map(user => 
            user.userId === userId ? {...user,...updates} : user
        );
        set({voiceUsers:updatedUsers});
    },
    addVoiceUser:(user)=>{
        const voiceUsers = get().voiceUsers;
        if(!voiceUsers.find(u => u.userId === user.userId)){
            set({voiceUsers:[...voiceUsers,user]});
        }
    },
    removeVoiceUser:(userId)=>{
        const voiceUsers = get().voiceUsers;
        set({voiceUsers:voiceUsers.filter(user => user.userId !== userId)});
    },
    closeChat:() => set({selectedChatData:undefined,selectedChatType:undefined,selectedChatMessages:[],}),
    addMessage:(message)=>{
        const selectedChatMessages = get().selectedChatMessages;
        const selectedChatType = get().selectedChatType;
        set({
            selectedChatMessages:[
                ...selectedChatMessages,{
                    ...message,
                    recipient:selectedChatType === "channel" ? message.recipient : message.recipient._id,
                    sender:selectedChatType === "channel" ? message.sender : message.sender._id,
                }

            ]
        })
    }
});