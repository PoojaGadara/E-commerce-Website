const express = require('express')
const {registerUser, LoginUser, logout, forgotPassword, resetPassword, getUserDetails, updatePassword, updateProfile, deleteUser, getAllUsers, getAllUser, updateUserRole, getSingleUser} = require('../Controller/userController')
const { isAuthenticateUser , authorizeRoles } = require('../middleware/auth')
const routes = express.Router()

routes.route('/user/new').post(registerUser)

routes.route('/user/login').post(LoginUser)

routes.route('/user/logout').get(logout)

routes.route('/password/forgot').post(forgotPassword)

routes.route('/password/reset/:token').put(resetPassword)

routes.route('/me').get(isAuthenticateUser,getUserDetails)

routes.route('/password/update').put(isAuthenticateUser,updatePassword)

routes.route('/me/update').put(isAuthenticateUser,updateProfile)

routes.route('/admin/users')
.get(isAuthenticateUser,authorizeRoles('admin'),getAllUsers);

routes.route('/admin/user/:id')
.get(isAuthenticateUser,authorizeRoles('admin'),getSingleUser)
.put(isAuthenticateUser,authorizeRoles('admin'),updateUserRole)
.delete(isAuthenticateUser,authorizeRoles('admin'),deleteUser)



module.exports = routes;