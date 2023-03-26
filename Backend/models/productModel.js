const mongoose = require('mongoose');

const productSchema =  mongoose.Schema({

   name:{
        type:String,
        required:[true,'Enter Product Name']
    },
    description:{
        type:String,
        required :[true,'Please Enter Description']
    },
    price:{
        type:Number,
        required : [true,'Please Enter Product Price'],
        MaxLength :[8,'Price can not excceed 8 character']
    },
    ratings:{
        type:Number,
        default : 0
    },
    images:[{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    }],
    category:{
        type:String,
        required:[true,'Please Enter Categaoy']
    },
    stock:{
        type:Number,
        required:[true,'Please Enter Stock'],
        MaxLength:[4,'Stock can not exceed 4 characters'],
        default:1
    },
    numOfReviews:{
        type:Number,
        default:0
    },
    reviews:[{
        name:{
            type:String,
            required:true
        },
        rating:{
            type:Number,
            required:true
        },
        comment:{
            type:String, 
            required:true
        }
    }],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: true,
      },
    createdAt:{
        type:Date,
        default:Date.now()
    }    
});
const productModel = new mongoose.model("product",productSchema)

module.exports = productModel;