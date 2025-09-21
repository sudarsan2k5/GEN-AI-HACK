import {Server as SockerIOServer} from "socket.io"
import Message from "./models/MessagesModel.js";
import VoiceChannel from "./models/VoiceChannelModel.js";
import Post from "./models/PostModel.js";


const setupSocket = (server) =>{
    const io = new SockerIOServer(server,{
        cors:{
            origin:process.env.ORIGIN,
            methods:["GET","POST"],
            credentials:true,
        },
    });

    const userSocketMap = new Map();
    const voiceRooms = new Map(); // voiceChannelId -> Set of socketIds
    const userVoiceState = new Map(); // userId -> { channelId, muted, deafened }


    const disconnect = async (socket) => {
        console.log(`Client Disconnected:${socket.id}`);
        let disconnectedUserId = null;
        
        for(const[userId,socketId] of userSocketMap.entries()){
            if(socketId===socket.id){
                disconnectedUserId = userId;
                userSocketMap.delete(userId);
                break;
            }
        }

        // Handle voice channel disconnect
        if (disconnectedUserId && userVoiceState.has(disconnectedUserId)) {
            const voiceState = userVoiceState.get(disconnectedUserId);
            await handleLeaveVoiceChannel(disconnectedUserId, voiceState.channelId, socket);
        }
    };

    const sendMessage = async(message) =>{
        const senderSocketId = userSocketMap.get(message.sender);
        const recipientSocketId = userSocketMap.get(message.recipient);

        const createdMessage = await Message.create(message);

        const messageData = await Message.findById(createdMessage._id)
        .populate("sender","id email firstName lastName image")
        .populate("recipient","id email firstName lastName image");

        if(recipientSocketId){
            io.to(recipientSocketId).emit("receiveMessage",messageData);
        }
        if(senderSocketId){
            io.to(senderSocketId).emit("receiveMessage",messageData);
        }
    }

    const broadcastNewPost = (postData) => {
        // Broadcast new post to all connected users
        io.emit("new-post", postData);
    };

    const broadcastPostUpdate = (postData) => {
        // Broadcast post updates (likes, comments) to all connected users
        io.emit("post-updated", postData);
    };

    // Expose socket functions globally for use in controllers
    global.socketFunctions = {
        broadcastNewPost,
        broadcastPostUpdate
    };

    io.on("connection",(socket)=>{
        const userId = socket.handshake.query.userId;


        if(userId){
            userSocketMap.set(userId,socket.id);
            console.log(`User connected:${userId} with socket ID:${socket.id}`);
        } else{
            console.log("User ID not provided during connection.")
        }


        socket.on("sendMessage",sendMessage);
        socket.on("join-voice-channel", (data) => handleJoinVoiceChannel(socket, data));
        socket.on("leave-voice-channel", (data) => handleLeaveVoiceChannel(socket.userId, data.channelId, socket));
        socket.on("webrtc-offer", (data) => handleWebRTCOffer(socket, data));
        socket.on("webrtc-answer", (data) => handleWebRTCAnswer(socket, data));
        socket.on("webrtc-ice-candidate", (data) => handleICECandidate(socket, data));
        socket.on("voice-state-update", (data) => handleVoiceStateUpdate(socket, data));
        socket.on("disconnect",()=>disconnect(socket));
    });

    // Voice Channel Handlers
    const handleJoinVoiceChannel = async (socket, data) => {
        try {
            const { channelId } = data;
            const userId = socket.handshake.query.userId;

            // Store socket userId for easier access
            socket.userId = userId;

            // Add user to voice room
            if (!voiceRooms.has(channelId)) {
                voiceRooms.set(channelId, new Set());
            }
            voiceRooms.get(channelId).add(socket.id);

            // Update user voice state
            userVoiceState.set(userId, {
                channelId,
                socketId: socket.id,
                muted: false,
                deafened: false
            });

            // Join socket to room
            socket.join(`voice-${channelId}`);

            // Notify others in the voice channel
            socket.to(`voice-${channelId}`).emit("user-joined-voice", {
                userId,
                channelId
            });

            // Send current users in voice channel to new user
            const currentUsers = Array.from(voiceRooms.get(channelId))
                .map(socketId => {
                    for (const [uId, vState] of userVoiceState.entries()) {
                        if (vState.socketId === socketId) return uId;
                    }
                })
                .filter(Boolean);

            socket.emit("voice-users-list", { channelId, users: currentUsers });

            console.log(`User ${userId} joined voice channel ${channelId}`);
        } catch (error) {
            console.error("Join voice channel error:", error);
        }
    };

    const handleLeaveVoiceChannel = async (userId, channelId, socket) => {
        try {
            if (!channelId) {
                const voiceState = userVoiceState.get(userId);
                if (voiceState) channelId = voiceState.channelId;
            }

            if (!channelId) return;

            // Remove from voice room
            if (voiceRooms.has(channelId)) {
                voiceRooms.get(channelId).delete(socket.id);
                if (voiceRooms.get(channelId).size === 0) {
                    voiceRooms.delete(channelId);
                }
            }

            // Remove user voice state
            userVoiceState.delete(userId);

            // Leave socket room
            socket.leave(`voice-${channelId}`);

            // Notify others in voice channel
            socket.to(`voice-${channelId}`).emit("user-left-voice", {
                userId,
                channelId
            });

            console.log(`User ${userId} left voice channel ${channelId}`);
        } catch (error) {
            console.error("Leave voice channel error:", error);
        }
    };

    const handleWebRTCOffer = (socket, data) => {
        const { targetUserId, offer, channelId } = data;
        const targetSocketId = userSocketMap.get(targetUserId);
        
        if (targetSocketId) {
            io.to(targetSocketId).emit("webrtc-offer", {
                fromUserId: socket.userId,
                offer,
                channelId
            });
        }
    };

    const handleWebRTCAnswer = (socket, data) => {
        const { targetUserId, answer, channelId } = data;
        const targetSocketId = userSocketMap.get(targetUserId);
        
        if (targetSocketId) {
            io.to(targetSocketId).emit("webrtc-answer", {
                fromUserId: socket.userId,
                answer,
                channelId
            });
        }
    };

    const handleICECandidate = (socket, data) => {
        const { targetUserId, candidate, channelId } = data;
        const targetSocketId = userSocketMap.get(targetUserId);
        
        if (targetSocketId) {
            io.to(targetSocketId).emit("webrtc-ice-candidate", {
                fromUserId: socket.userId,
                candidate,
                channelId
            });
        }
    };

    const handleVoiceStateUpdate = (socket, data) => {
        const { muted, deafened, channelId } = data;
        const userId = socket.userId;

        if (userVoiceState.has(userId)) {
            const voiceState = userVoiceState.get(userId);
            voiceState.muted = muted;
            voiceState.deafened = deafened;

            // Notify others in voice channel
            socket.to(`voice-${channelId}`).emit("voice-state-changed", {
                userId,
                muted,
                deafened
            });
        }
    };
};

export default setupSocket;