import mongoose from "mongoose";
import User from "../models/Usermodel.js";
import Message from "../models/MessagesModel.js";

export const searchContacts = async (req, res) => {
  try {
    const { searchTerm } = req.body;

    if (!searchTerm || searchTerm.trim() === "") {
      return res.status(400).json({ error: "Search term is required." });
    }

    // Escape regex special characters safely
    const sanitizedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Build regex safely
    const regex = new RegExp(sanitizedSearchTerm, "i");

    // Perform search
    const contacts = await User.find({
      _id: { $ne: req.userId }, // exclude logged-in user
      $or: [
        { firstName: { $regex: regex } },
        { lastName: { $regex: regex } },
        { email: { $regex: regex } },
      ],
    }).select("firstName lastName email _id image");

    return res.status(200).json({ contacts });
  } catch (error) {
    console.error("Search Contacts Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



export const getContactsForDMList = async (req, res) => {
  try {
    let {userId} = req;
    userId=new mongoose.Types.ObjectId(userId);

    const contacts = await Message.aggregate([
      {
        $match:{
          $or:[{sender:userId},{recipient:userId}],
        },
      },
      {
        $sort:{timestamp:-1},
      },
      {$group:{
        _id:{
          $cond:{
            if:{$eq:["$sender",userId]},
            then:"$recipient",
            else:"$sender",
          },
        },
        lastMessageTime:{$first:$timestamp},
      },
    },
    {$lookup:{
      from:"users",
      localField:"_id",
      foreignField:"_id",
      as: "contactInfo",
    },
  },
  {
    $unwind:"$contactInfo",
  },
  {
    $project:{
      _id:1,
      lastMessageTime:1,
      email:"$contactInfo.email",
      firstName:"$contactInfo.firstName",
      lastName:"$contactInfo.lastName",
      image:"$contactInfo.image",
    },
  },
  {
    $sort:{lastMessageTime:-1},
  }
]);

    return res.status(200).json({ contacts });
  } catch (error) {
    console.error("Search Contacts Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



export const getAllContacts = async (req, res) => {
  try {
       
    const users = await User.find({_id:{$ne: req.userId}},"firstName lastName _id email");

    const contacts= users.map((user)=>({
      label: user.firstName ?`${user.firstName} ${user.lastName}`: user.email,
      value:user._id,
    }));
    

    return res.status(200).json({ contacts });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
