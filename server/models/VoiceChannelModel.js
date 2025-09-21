import mongoose from "mongoose";

const voiceChannelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Channel",
    required: false, // Voice channels can be standalone
  },
  type: {
    type: String,
    enum: ["voice"],
    default: "voice",
  },
  maxUsers: {
    type: Number,
    default: 99,
    min: 1,
    max: 99,
  },
  bitrate: {
    type: Number,
    enum: [64000, 96000, 128000],
    default: 64000,
  },
  connectedUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    socketId: {
      type: String,
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    muted: {
      type: Boolean,
      default: false,
    },
    deafened: {
      type: Boolean,
      default: false,
    },
  }],
  isTemporary: {
    type: Boolean,
    default: false,
  },
  isPublic: {
    type: Boolean,
    default: true, // Voice channels are public by default like Discord
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

voiceChannelSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

voiceChannelSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const VoiceChannel = mongoose.model("VoiceChannel", voiceChannelSchema);
export default VoiceChannel;
