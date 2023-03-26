const productModel = require('../models/productModel')
const Errorhandler = require('../utills/errorHandler')
const catchAsyceError = require('../middleware/catchAsyncError')
const ApiFeatures = require('../utills/apifeatures')
const { mongoose } = require('mongoose')

//get All Product 
exports.getAllProducts =  async (req,res,next) => {

  //  console.log( req.body.user)
    const productCount = await productModel.countDocuments()
    const resultPerPage = 8;
    const apiFeatuer = new ApiFeatures(productModel.find(),req.query)
    .search()
    .filter()
    .pagination(resultPerPage)
    const products= await apiFeatuer.query;
    res.status(200).json({
       success:true,
       products
    })
}
//create Product -----Admin
exports.createProduct =catchAsyceError( async (req,res) => {

  
    const productCount = await productModel.countDocuments()
    const product = await productModel.create(req.body);
    return res.status(201).json({
        success:true,
        data : product , productCount
    })
});

//Create Product Details
exports.getProductDetails =catchAsyceError(async (req,res,next) => {
    const product = await productModel.findById(req.params.id)

    if(!product){
        return next(new Errorhandler("Product Not Found" , 404))
    }

    res.status(200).json({
        success:true,
       product
    })
});

//Update Product ----admin
exports.updateProduct = catchAsyceError(async (req,res,next) => {

    let product = await productModel.findById(req.params.id)
    
    product = await productModel.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify: false
    })

    res.status(200).json({
        success:true,
        data : product
    })

    if(!product){
        return next(new Errorhandler("Product Not Found" , 404))
    }
});

//Delete Product
    exports.deleteProduct = catchAsyceError(async (req,res,next) => {

        const product = await productModel.findById(req.params.id)
        
        if(!product){
            return next(new Errorhandler("Product Not Found" , 404))
        }
        await product.remove()

        res.status(200).json({
            success:true,
            message : 'Product deleted Succesfully'
        })
    });

//create New Review or Update the review
exports.createProductReview = catchAsyceError(async (req,res,next)=> {

    const {rating ,comment ,productId} = req.body


    const review = {
        user : req.user._id,
        name:req.user.name,
        rating : Number(rating),
        comment,
    }
  
    const product = await productModel.findOne({productId})

    const isReviewed = product.reviews.find(
        (rev) => rev.user === req.user._id
      );
    
      if (isReviewed) {
        product.reviews.forEach((rev) => {
          if (rev.user === req.user._id)
            (rev.rating = rating), (rev.comment = comment);
        });
      } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
      }

    let avg=0;
    product.reviews.forEach(rev => {
        avg += rev.rating
    })
    
    product.ratings = avg /product.reviews.length;

    await product.save({validateBeforeSave : false});

    res.status(200).json({
        success : true,
        product
    })
});

exports.getProductReviews = catchAsyceError(async (req,res,next) => {
    const product = await productModel.findById(req.query.id);

    if(!product){
        return next(new Errorhandler('Product not Found',404));
    }

    res.status(200).json({
        success : true,
        product
    })
})

// Delete Reviews

exports.deleteReview = catchAsyceError(async (req, res, next) => {
    const product = await productModel.findById(req.query.productId);
  
    if (!product) {
      return next(new Errorhandler("Product not found", 404));
    }
  
    const reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== req.query.id.toString()
    );
  
    let avg = 0;
  
    reviews.forEach((rev) => {
      avg += rev.rating;
    });
  
    let ratings = 0;
  
    if (reviews.length === 0) {
      ratings = 0;
    } else {
      ratings = avg / reviews.length;
    }
  
    const numOfReviews = reviews.length;
  
    await productModel.findByIdAndUpdate(
      req.query.productId,
      {
        reviews,
        ratings,
        numOfReviews,
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );
  
    res.status(200).json({
      success: true,
    });
  });