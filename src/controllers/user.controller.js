import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (user_id) => {
  try {
    const user = await User.findById(user_id);
    console.log(user);
    const accessToken = await user.generateAccessToken();
    console.log("\nh\n");
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(400, "something went wrong generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation --> email format check not empty etc
  // check if already exists : username email
  // check for images avatar
  // upload them to cloudinary , avatar check
  // create user object
  // create entry in db
  // remove password and refresh token field from response
  // check user creation
  // if yes return response
  // console.log("FILES => ", req.files);
  // console.log("BODY => ", req.body);
  const { fullName, email, username, password } = req.body;

  if (
    [fullName, username, email, password].some((field) => field.trim() == "")
  ) {
    throw new ApiError(400, "All Fields are Required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User Already Exists!. ");
  }

  const avatarFilePath = req.files?.avatar[0]?.path;
  const coverImgFilePath = req.files?.coverImg[0]?.path;

  if (!avatarFilePath) {
    throw new ApiError(400, "Avatar File is Required. please provide a file");
  }

  const avatar = await uploadOnCloudinary(avatarFilePath);
  const coverImage = await uploadOnCloudinary(coverImgFilePath);
  // console.log(avatar);
  if (!avatar) {
    throw new ApiError(400, "Avatar File is Required. ");
  }
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImg: coverImage?.url || "",
    username: username.toLowerCase(),
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError("Something Went wron while registering the user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Succesfully "));
});

const loginUser = asyncHandler(async (req, res) => {
  // get password username or email from req.body
  // validate if not emply
  // find user
  // check if user password is corecct
  // generate token
  // pass token to cookies
  const { username, password, email } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "Username or Email is required");
  }
  if (!password) {
    throw new ApiError(400, "Password is REquired");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(400, "User Doesnot exist . ");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect Password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedinUser = await User.findById(user._id).select(
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
    .json(
      new ApiResponse(
        200,
        {
          user: loggedinUser,
          accessToken,
          refreshToken,
        },
        "Successfully Logged In"
      )
    );
});

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
    .json(new ApiResponse(200, {}, "User Logged Out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized request");
    }

    const decodedtoken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    if (!decodedtoken) {
      throw new ApiError(401, "invalid refreshToken");
    }

    const user = await User.findById(decodedtoken._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh Token");
    }
    if (incomingRefreshToken != user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is expired or used");
    }

    const { newrefreshToken, accessToken } =
      await generateAccessAndRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            newrefreshToken,
          },
          "access Token Refresh token rereshed"
        )
      );
  } catch (error) {
    throw new ApiError(400, "Something when wrong with refresh token");
  }
});

const changeCurrentUserPassword = asyncHandler(async (req, res) => {});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentUserPassword,
};
