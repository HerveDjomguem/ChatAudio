const User = require("../models/userModel");
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require('multer');
const cloudinary = require("../cloudinary");

// user registration

router.post("/register", async (req, res) => {
  try {
    // check if user already exists
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.send({
        success: false,
        message: "User already exists",
      });
    }

    // create new user
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashedPassword;
    const newUser = new User(req.body);
    await newUser.save();
    res.send({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

// user login

router.post("/login", async (req, res) => {
  try {
    // check if user exists

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.send({
        success: false,
        message: "User does not exist",
      });
    }

    // check if password is correct

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.send({
        success: false,
        message: "Invalid password",
      });
    }

    // create and assign a token

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.send({
      success: true,
      message: "User logged in successfully",
      data: token,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

// get current user

router.get("/get-current-user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    res.send({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

// get all users except current user

router.get("/get-all-users", authMiddleware, async (req, res) => {
  try {
    const allUsers = await User.find({ _id: { $ne: req.body.userId } });
    res.send({
      success: true,
      message: "Users fetched successfully",
      data: allUsers,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) =>{
    const isValid =  MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mini type");
    if(isValid){
       error = null;
    }
    cb(error, "server/files");
  },
   filename: (req,file,cb) =>{
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now()+ '.' + ext);
 }
});
// update user profile picture

router.post("/update-profile-picture", authMiddleware,multer({storage: storage}).single("image"), async (req, res) => {
 
  const url = req.protocol + '://' + req.get("host");
     const profilePic = url + "/files/"+req.file.filename;
 try {
    const image = req.body.image;

    // upload image to cloudinary and get url

    const uploadedImage = await cloudinary.uploader.upload(image, {
      folder: "ksr",
    });
   
    // update user profile picture

    const user = await User.findOneAndUpdate(
      { _id: req.body.userId },
      { profilePic:profilePic },
      { new: true }
    );

    res.send({
      success: true,
      message: "Profile picture updated successfully",
      data: user,
    });
  } catch (error) {
   
    res.send({
      message: error.message,
      success: false,
    });
  }
});

/*
// A revoir probleme id
router.put("/update-profile-picture", authMiddleware, multer({storage: storage}).single("image"),(req, res, next)=>{
  let profilePic = req.body.profilePic;
  if(req.file) {
    const url = req.protocol + '://' + req.get("host");
    profilePic = url + "/files/"+req.file.filename
  }
  const post =new User({
    _id: req.body.id,
    name: req.body.title,
    email: req.body.email,
    profilePic:profilePic,
   // timestamps: req.body.timestamps
  });
  console.log(post);
  User.updateOne({_id: req.params.id}, post).then(result =>{
    console.log(result)
    res.send({
      success: true,
      message: "Profile picture updated successfully",
      data: post,
    });
  });
}); */

module.exports = router;
