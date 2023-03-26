const express = require('express');
const { newOrder, myOrders ,getSingleOrder, updateOrder, deleteOrder, getAllOrders } = require('../Controller/orderController');
const { isAuthenticateUser , authorizeRoles } = require('../middleware/auth');
const { route } = require('./userRoutes');
const router = express.Router();

router.route('/order/new').post(isAuthenticateUser,newOrder);
router.route('/order/:id')
.get(isAuthenticateUser ,getSingleOrder)

router.route('/order/me').get(isAuthenticateUser ,myOrders)

router.route('/admin/orders').get(isAuthenticateUser,authorizeRoles('admin') ,getAllOrders)
router
.route('/admin/order/:id')
.put(isAuthenticateUser ,authorizeRoles('admin'),updateOrder)
.delete(isAuthenticateUser,authorizeRoles('admin'),deleteOrder)

module.exports = router;