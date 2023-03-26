const orderModel = require('../models/orderModel')
const productModel = require('../models/productModel');
const Errorhandler = require('../utills/errorHandler')
const catchAsyceError = require('../middleware/catchAsyncError');
const { off } = require('../models/orderModel');

//Create New Order
exports.newOrder = catchAsyceError(async(req,res,next)=>{
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    } = req.body;

    const order = await orderModel.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt:Date.now(),
        user:req.user._id
    });

    res.status(201).json({
        success:true,
        order
    })
});

//Get Single Order

exports.getSingleOrder = catchAsyceError(async (req,res,next) => {
    const order = await orderModel.findById(req.params.id).populate(
        "user",
        "name email"
    );

    if(!order) {
        return next(new Errorhandler("Order not found with this Id",404));
    }

    res.status(200).json({
        success:true,
        order
    })
});

//Get logged in user Order

exports.myOrders = catchAsyceError(async (req,res,next) => {
    const orders = await orderModel.find({user : req.user._id});

    res.status(200).json({
        success:true,
        orders
    })
});

//get All Orders ----Admin

exports.getAllOrders = catchAsyceError(async(req,res,next) => {
    const orders = await orderModel.find();

    let totalAmount = 0;

    orders.forEach((order) => {
        totalAmount += order.totalPrice;
    });

    res.status(200).json({
        success : true,
        totalAmount,
        orders
    })
});

//update Order Status -----Admin
exports.updateOrder = catchAsyceError(async(req,res,next) => {
    const order = await orderModel.findById(req.params.id);

    if(order.orderStatus === "Delivered") {
        return next(new Errorhandler("You have already delivered this order",400))
    }

    order.orderItems.forEach( async(o) => {
        await updateStock(o.product,o.quantity);
    });

    order.orderStatus = req.body.status;

    if(req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
    }

    await order.save({validateBeforeSave : false})

    res.status(200).json({
        success :true,
    });
});

async function updateStock(id,quantity){
    const product = await productModel.findById(id);

    product.Stock -= quantity;

    await product.save({validateBeforeSave : false});
}

//Delete Order ----Admin

exports.deleteOrder = catchAsyceError(async (req,res,next) => {
        const order = await orderModel.findById(req.params.id);
      
        if(!order) {
                return next(new Errorhandler("Order not found with this Id",404));
        }

        await order.remove();

        res.status(200).json({
            success : true,
            order
        })
 });