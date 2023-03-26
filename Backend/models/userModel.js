const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt  = require('jsonwebtoken')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please Enter Name'],
        maxLength:[30,'Name can not excced 30 characters'],
        minLength:[4,'Name Must have more than 4 Characters']
    },
    email:{
        type:String,
        required:[true,'Please Enter Email'],
        unique:true,
        validate:[validator.isEmail,'Please Enter Validate Email Address']
    },
    password:{
        type:String,
        required:[true,'Please Enter Password'],
        minLength:[8,'Password should not less than 8 Characters'],
        select:false,
    },
    avtar:{
            public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                required:true
            }
        },
    role:{
        type:String,
        default:'user'
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date 
});
userSchema.pre("save",async function(next) {
    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password,10)
});

//JWT Token
userSchema.methods.getJWTToken = function (){
    return jwt.sign({id:this._id},process.env.SECRETKEY,{
        expiresIn : process.env.JWT_EXPIER
    });
}
//comapre Password
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };
  

//Generating Password Reset Token
userSchema.methods.getResetPasswordToken =function (){
    //Generating Token
    const resetToken = crypto.randomBytes(20).toString("hex")
    //Hasing and adding resetPasswordToken to userSchema
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetPasswordExpire = Date.now() + 15 * 60 *1000;

    return resetToken;
}

module.exports = mongoose.model('user',userSchema)