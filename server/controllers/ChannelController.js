import mongoose from "mongoose";
import Channel from "../models/ChannelModel.js";
import User from "../models/Usermodel.js";

export const createChannel = async (req, res) => {
  try {
    const {name,members}=req.body;
    const userId= req.user.id;

    const admin = await User.findById(userId);

    if(!admin){
        return res.status(400).send("Admin user not found.");
    }

    const validMembers = await User.find({_id:{$in:members}});


    if(validMembers.length !== members.length){
        return res.status(400).send("Some members are not valid users.");
    }


    const newChannel = new Channel({
        name,members,admin:userId,
    });


    await newChannel.save();
    return res.status(201).json({channel:newChannel});
  } catch (error) {
    console.error("Update Profile Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



export const getUserChannels = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const channels = await Channel.find({
      $or: [{ admin: userId }, { members: userId }],
    })
      .select("name members admin updatedAt") // explicitly select fields you want
      .sort({ updatedAt: -1 });

    return res.status(200).json({ channels }); // status 200 for GET
  } catch (error) {
    console.error("Get User Channels Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

