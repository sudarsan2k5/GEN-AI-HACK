import { compare } from "bcrypt";
import User from "../models/Usermodel.js";
import jwt from "jsonwebtoken";
import { request, response } from "express";
import {renameSync,unlinkSync} from "fs";

const maxAge = 3 * 24 * 60 * 60; // 3 days in seconds

// ✅ make payload consistent (use `id`)
const createToken = (userId, email) => {
  return jwt.sign({ id: userId, email }, process.env.JWT_KEY, { expiresIn: maxAge });
};

export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and Password are required" });
    }

    const user = await User.create({ email, password });

    // ✅ set cookie with consistent name
    res.cookie("jwt", createToken(user.id, email), {
      httpOnly: true,
      maxAge: maxAge * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and Password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User with the given email not found" });
    }

    const auth = await compare(password, user.password);
    if (!auth) {
      return res.status(400).json({ error: "Password is incorrect" });
    }

    res.cookie("jwt", createToken(user.id, email), {
      httpOnly: true,
      maxAge: maxAge * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUserInfo = async (req, res) => {
  try {
    const userData = await User.findById(req.user.id); // ✅ verifyToken sets req.user
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.color,
    });
  } catch (error) {
    console.error("GetUserInfo Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ from verifyToken
    const { firstName, lastName, color } = req.body;

    const userData = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, color, profileSetup: true },
      { new: true, runValidators: true }
    );

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.color,
    });
  } catch (error) {
    console.error("Update Profile Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const addProfileImage = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ from verifyToken
    const { firstName, lastName, color } = req.body;

    const userData = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, color, profileSetup: true },
      { new: true, runValidators: true }
    );

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.color,
    });
  } catch (error) {
    console.error("Update Profile Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


export const removeProfileImage = async (req, res) => {
  try {
    if(!request.file){
      return response.status(400).send("File is required.");
    }

    const date = Date.now();
    let fileName = "uploads/profiles/" +date +request.file.originalname;
    renameSync(request.file.path,fileName);

    const updatedUser = await User.findByIdAndUpdate(request.userId,{image:fileName},{new:true,runValidators:true});


    return res.status(200).json({
      
      image: updatedUser.image,
    });
  } catch (error) {
    console.error("Update Profile Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


export const logout = async (req, res) => {
  try {
    res.cookie("jwt","",{maxAge:1,secure:true,sameSite:"None"});
    res.status(200).send("Logout Successfull.");
  } catch (error) {
    console.error("Update Profile Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};





