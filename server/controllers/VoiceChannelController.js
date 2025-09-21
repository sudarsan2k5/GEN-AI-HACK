import mongoose from "mongoose";
import VoiceChannel from "../models/VoiceChannelModel.js";
import User from "../models/Usermodel.js";

export const createVoiceChannel = async (req, res) => {
  try {
    console.log("📞 Creating voice channel with data:", req.body);
    console.log("📞 User:", req.user);
    
    const { name, members, maxUsers, bitrate, channelId, isPublic } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const admin = await User.findById(userId);
    if (!admin) {
      return res.status(400).json({ error: "Admin user not found." });
    }

    const validMembers = await User.find({ _id: { $in: members || [] } });
    if (members && validMembers.length !== members.length) {
      return res.status(400).json({ error: "Some members are not valid users." });
    }

    const newVoiceChannel = new VoiceChannel({
      name,
      members: members || [],
      admin: userId,
      maxUsers: maxUsers || 99,
      bitrate: bitrate || 64000,
      channelId: channelId || null,
      isPublic: isPublic !== undefined ? isPublic : true, // Default to public
    });

    await newVoiceChannel.save();
    console.log("📞 Voice channel created successfully:", newVoiceChannel._id);
    return res.status(201).json({ voiceChannel: newVoiceChannel });
  } catch (error) {
    console.error("Create Voice Channel Error:", error.message);
    console.error("Full error:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

export const getUserVoiceChannels = async (req, res) => {
  try {
    console.log("📞 Getting voice channels for user:", req.user?.id);
    console.log("📞 Auth middleware user object:", req.user);
    
    if (!req.user?.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    // Show all public voice channels + private ones where user is admin/member
    const voiceChannels = await VoiceChannel.find({
      $or: [
        { isPublic: true }, // All public voice channels
        { admin: userId }, // Private channels where user is admin
        { members: userId }, // Private channels where user is member
      ],
    })
      .populate("admin", "id email firstName lastName image")
      .populate("members", "id email firstName lastName image")
      .populate("connectedUsers.userId", "id email firstName lastName image")
      .select("name maxUsers bitrate connectedUsers isTemporary isPublic admin createdAt updatedAt")
      .sort({ updatedAt: -1 });

    console.log("📞 Found voice channels:", voiceChannels.length);
    return res.status(200).json({ voiceChannels });
  } catch (error) {
    console.error("Get User Voice Channels Error:", error.message);
    console.error("Full error:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

export const joinVoiceChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { socketId } = req.body;
    const userId = req.user.id;

    const voiceChannel = await VoiceChannel.findById(channelId);
    if (!voiceChannel) {
      return res.status(404).json({ error: "Voice channel not found" });
    }

    // Check if user is already in the channel
    const existingUser = voiceChannel.connectedUsers.find(
      user => user.userId.toString() === userId
    );

    if (existingUser) {
      return res.status(400).json({ error: "User already in voice channel" });
    }

    // Check max users limit
    if (voiceChannel.connectedUsers.length >= voiceChannel.maxUsers) {
      return res.status(400).json({ error: "Voice channel is full" });
    }

    // Add user to voice channel
    voiceChannel.connectedUsers.push({
      userId,
      socketId,
      joinedAt: new Date(),
      muted: false,
      deafened: false,
    });

    await voiceChannel.save();

    const updatedChannel = await VoiceChannel.findById(channelId)
      .populate("connectedUsers.userId", "id email firstName lastName image");

    return res.status(200).json({ voiceChannel: updatedChannel });
  } catch (error) {
    console.error("Join Voice Channel Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const leaveVoiceChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user.id;

    const voiceChannel = await VoiceChannel.findById(channelId);
    if (!voiceChannel) {
      return res.status(404).json({ error: "Voice channel not found" });
    }

    // Remove user from voice channel
    voiceChannel.connectedUsers = voiceChannel.connectedUsers.filter(
      user => user.userId.toString() !== userId
    );

    await voiceChannel.save();

    // If temporary channel and empty, delete it
    if (voiceChannel.isTemporary && voiceChannel.connectedUsers.length === 0) {
      await VoiceChannel.findByIdAndDelete(channelId);
      return res.status(200).json({ message: "Left voice channel and deleted temporary channel" });
    }

    const updatedChannel = await VoiceChannel.findById(channelId)
      .populate("connectedUsers.userId", "id email firstName lastName image");

    return res.status(200).json({ voiceChannel: updatedChannel });
  } catch (error) {
    console.error("Leave Voice Channel Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateVoiceState = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { muted, deafened } = req.body;
    const userId = req.user.id;

    const voiceChannel = await VoiceChannel.findById(channelId);
    if (!voiceChannel) {
      return res.status(404).json({ error: "Voice channel not found" });
    }

    const userIndex = voiceChannel.connectedUsers.findIndex(
      user => user.userId.toString() === userId
    );

    if (userIndex === -1) {
      return res.status(400).json({ error: "User not in voice channel" });
    }

    // Update user's voice state
    if (typeof muted === 'boolean') {
      voiceChannel.connectedUsers[userIndex].muted = muted;
    }
    if (typeof deafened === 'boolean') {
      voiceChannel.connectedUsers[userIndex].deafened = deafened;
    }

    await voiceChannel.save();

    const updatedChannel = await VoiceChannel.findById(channelId)
      .populate("connectedUsers.userId", "id email firstName lastName image");

    return res.status(200).json({ voiceChannel: updatedChannel });
  } catch (error) {
    console.error("Update Voice State Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getVoiceChannelUsers = async (req, res) => {
  try {
    const { channelId } = req.params;

    const voiceChannel = await VoiceChannel.findById(channelId)
      .populate("connectedUsers.userId", "id email firstName lastName image")
      .select("connectedUsers");

    if (!voiceChannel) {
      return res.status(404).json({ error: "Voice channel not found" });
    }

    return res.status(200).json({ users: voiceChannel.connectedUsers });
  } catch (error) {
    console.error("Get Voice Channel Users Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
