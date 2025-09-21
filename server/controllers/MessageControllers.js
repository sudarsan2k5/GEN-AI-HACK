import { request, response } from "express";
import Message from "../models/MessagesModel.js";

import {mkdirSync, renameSync} from 'fs'

export const getMessages = async (req, res) => {
  try {
    const user1 = req.userId; // ✅ use req, not request
    const user2 = req.body.id;

    if (!user1 || !user2) {
      return res.status(400).json({ error: "Both UserID's are required." });
    }

    // Exclude logged-in user (verifyToken should set req.userId)
    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    }).sort({ timestamp: 1 });

    return res.status(200).json({ messages });
  } catch (error) {
    console.error("Get Messages Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const uploadFile = async (req, res) => {
  try {
    if(!req.file){
      return res.status(400).send("File is required");
    }

    const date = Date.now();
    let fileDir = `uploads/files/${date}`;
    let fileName = `${fileDir}/${req.file.originalname}`;


    mkdirSync(fileDir,{recursive:true});
    renameSync(req.file.path,fileName);
    return res.status(200).json({ filePath:fileName });
  } catch (error) {
    console.error("Get Messages Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


