const Errorhandler = require('../utills/errorHandler')
const catchAsyceError = require('../middleware/catchAsyncError')
const userModel = require('../models/userModel');
const sendToken = require('../utills/jwtToken')
const sendEmail = require('../utills/sendEmail')
const crypto = require('crypto');

//Register User
exports.registerUser = catchAsyceError(async (req,res)=>{

    const {name,email,password} = req.body;
    const user = await userModel.create({
        name,email,password,
        avtar:{
            public_id:'This is sample Id',
            url:"ProfilePicture"
        }
    });
    sendToken(user,201,res)
});

//Login User
exports.LoginUser = catchAsyceError(async(req,res,next)=> {
    const { email, password } = req.body;

    // checking if user has given password and email both
  
    if (!email || !password) {
      return next(new Errorhandler("Please Enter Email & Password", 400));
    }
  
    const user = await userModel.findOne({ email }).select("+password");
  
    console.log(user)

    if (!user) {
      return next(new Errorhandler("Invalid email or password", 401));
    }
  
    const isPasswordMatched = await user.comparePassword(password);

    console.log(isPasswordMatched)
  
    if (!isPasswordMatched) {
      return next(new Errorhandler("Invalid email or password", 401));
    }
  
    sendToken(user, 200, res);
})

//Logout User
exports.logout = catchAsyceError(async(req,res,next) => {
    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true,
    })

    res.status(200).json({
        success :true,
        message:"Logged Out"
    });
})

//Forget Password
exports.forgotPassword = catchAsyceError(async(req,res,next) => {
    const user = await userModel.findOne({email : req.body.email})

    if(!user){
        return next(new Errorhandler('User Not Found',404))
    }

    //Get ResetPassword Token 
    const resettoken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave : false});

    const resetPasswordUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resettoken}`

    const message =  `You password reset token is :- \n\n ${resetPasswordUrl} \n\n if you don't requested email then , please ignore it`;

    try {

        await sendEmail({

            email:user.email,
            subject: `Ecommerce Password Recovery`,
            message,
        })

        res.status(200).json({
            success : true,
            message:    `Email send to ${user.email} successfully`
        }) 
        
    } catch (error) {
          user.resetPasswordToken = undefined;
          user.resetPasswordExpire = undefined

          await user.save({ validateBeforeSave : false});

          return next(new Errorhandler(error.message,500))
    }
});

//Reset Passwprd 
exports.resetPassword = catchAsyceError(async (req, res, next) => {
    // creating token hash
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
  
    const user = await userModel.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
  
    if (!user) {
      return next(
        new Errorhandler(
          "Reset Password Token is invalid or has been expired",
          400
        )
      );
    }
  
    if (req.body.password !== req.body.confirmPassword) {
      return next(new ErrorHander("Password does not password", 400));
    }
  
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
  
    await user.save();
  
    sendToken(user, 200, res);
  });


//Get User Detail
exports.getUserDetails = catchAsyceError(async(req,res,next)=>{
    const user = await userModel.findById(req.user.id);

    res.status(200).json({
        success:true,
        user,
    })
})

//update User Password
exports.updatePassword = catchAsyceError(async (req, res, next) => {
    const user = await userModel.findById(req.user.id).select("+password");
  
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
  
    if (!isPasswordMatched) {
      return next(new Errorhandler("Old password is incorrect", 400));
    }
  
    if (req.body.newPassword !== req.body.confirmPassword) {
      return next(new Errorhandler("password does not match", 400));
    }
  
    user.password = req.body.newPassword;
  
    await user.save();
  
    sendToken(user, 200, res);
  });

//Update User Profile
exports.updateProfile = catchAsyceError(async(req,res,next) =>{

    const newUserData = {
        name:req.body.name,
        email:req.body.email,
    }
    //we will add cloudary later

    const user = await userModel.findByIdAndUpdate(req.user.id,newUserData,{
        new : true,
        runValidators : true,
        useFindModify:false
    })

    res.status(200).json({
        success : true,
        user
    });
});

//Delete User 
exports.deleteUser = catchAsyceError(async (req,res,next) => {
    const user = await userModel.findById(req.params.id);

    //we will remove cloudinary later

    if(!user){
        return next(
            new Errorhandler(`User does not exits with with Id${req.params.id}`)
        )
    }
    await user.remove();
    res.status(200).json({
        success:true,
        message:"User Deleted Successfully"
    });
});

//Get All users --- Admin
exports.getAllUsers = catchAsyceError(async (req,res,next) => {
  const users = await userModel.find();

    res.status(200).json({
      success : true,
      users,
    });
});


//Get Single User Data -- Admin
exports.getSingleUser = catchAsyceError(async (req,res,next) =>{
  
  const user= await userModel.findById(req.params.id);

  if(!user){
    return next(new Errorhandler(`User does not exist with Id: ${req.params.id}`))
  }
  
  res.status(200).json({
    success:true,
    user
  });
});

//Update User Role --- Admin
exports.updateUserRole = catchAsyceError(async(req,res,next) =>{

  const newUserData = {
      name:req.body.name,
      email:req.body.email,
      role : req.body.role
  }
  const user = await userModel.findByIdAndUpdate(req.params.id,newUserData,{
      new : true,
      runValidators : true,
      useFindModify:false
  })

  res.status(200).json({
      success : true,
      user
  });
});



