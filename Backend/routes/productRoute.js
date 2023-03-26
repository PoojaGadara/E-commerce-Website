const express = require('express');
const mongoose = require('mongoose');
const { getAllProducts , createProduct, updateProduct, deleteProduct, getProductDetails,createProductReview, getProductReviews, deleteReview} = require('../Controller/productController');
const router = express.Router();
const {isAuthenticateUser,authorizeRoles} = require('../middleware/auth')

router.route('/product').get(getAllProducts)
router.route('/product/new').post(isAuthenticateUser,authorizeRoles("admin") ,createProduct)

router.route("/product/:id").get(getProductDetails);

router.route('/product/:id')
.put(isAuthenticateUser ,authorizeRoles("admin"),updateProduct)
.delete(isAuthenticateUser ,authorizeRoles("admin"),deleteProduct)

router.route('/review').put(isAuthenticateUser,createProductReview)

router
    .route('/reviews')
    .get(getProductReviews)
    .delete(isAuthenticateUser,deleteReview)

module.exports = router; 