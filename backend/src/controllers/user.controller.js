import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import nodemailer from 'nodemailer'
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({validateBeforeSave: false})

      return {accessToken, refreshToken}
  } catch (error) {
      throw new ApiError(500, "Something went wrong while generating tokens")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  )
    throw new ApiError(402, "All fields are required");
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(402, "User with email or username already exist");
  }
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400,"Avatar file is required")
  }
  const avatar = uploadOnCloudinary(avatarLocalPath);
  const user = await User.create({
    fullname,
    email,
    username: username.toLowerCase(),
    password,
    avatar: avatar?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) throw new ApiError(400, "Error creating user!");
  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User registerd successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "Email or username is required");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) throw new ApiError(400, "User does not exist");
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(400, "Invalid User credentials");
  const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedInUser, "User logged in Successfully"));
});

const otpEmailVerification = asyncHandler( async (req,res) => {
  try {
    const email = req.user.email;
    const otp = `${1000+Math.random()*9000}`;
    // update otp in the database
    await User.findByIdAndUpdate(req.user._id,{
      $set: {
        otp, otpExpiry: new Date(Date.now() + 10 * 60 * 1000) 
      }
    },
      {new:true}
    )
    
    // create nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'demo1email2sender@gmail.com',
        pass: 'demoemail'
      }
    })
    // mail options
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Verify your email",
      html: `<p><b>${otp}</b> is your otp for Instagram. Use this otp to complete email verification. Otp is valid for 10 minutes</p>`
    }

    // send email
    transporter.sendMail(mailOptions,(error,info)=>{
      if(error){
        console.log(error);
        throw new ApiError(500, "Error sending email")
      } else {
        console.log("Email sent: " + info.response);
        res.status(200).json(new ApiResponse(200,{},"OTP sent successfully"))
      }
    })
  } catch (error) {
    throw new ApiError(500, "Error sending OTP email");
  }
})

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const changeCurrentPassword = asyncHandler(async(req,res)=>{

})

export { registerUser, loginUser,logoutUser,otpEmailVerification };
