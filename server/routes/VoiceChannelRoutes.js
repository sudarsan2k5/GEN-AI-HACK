import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { 
  createVoiceChannel, 
  getUserVoiceChannels, 
  joinVoiceChannel, 
  leaveVoiceChannel, 
  updateVoiceState, 
  getVoiceChannelUsers 
} from "../controllers/VoiceChannelController.js";

const voiceChannelRoutes = Router();

voiceChannelRoutes.post("/create-voice-channel", verifyToken, createVoiceChannel);
voiceChannelRoutes.get("/get-user-voice-channels", verifyToken, getUserVoiceChannels);
voiceChannelRoutes.post("/join/:channelId", verifyToken, joinVoiceChannel);
voiceChannelRoutes.post("/leave/:channelId", verifyToken, leaveVoiceChannel);
voiceChannelRoutes.put("/voice-state/:channelId", verifyToken, updateVoiceState);
voiceChannelRoutes.get("/users/:channelId", verifyToken, getVoiceChannelUsers);

export default voiceChannelRoutes;
