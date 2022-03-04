const User = require('../models/User');
const crypto = require('crypto');
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require('../utils/sendEmail');

exports.register = async (req,res,next) => {
    console.log('request')
    const {username, email, password} = req.body

    try {
        const user = await User.create({
            username,email,password
        });
        
        sendToken(user, 200, res);
    } 
    catch (error) {
        res.status(500).json({success:false, error:error.errors});
    }
}

exports.login = async (req,res,next) => {
    const {email, password} = req.body;
    if(!email || !password){
        return next(new ErrorResponse("Please proide an email and password", 400));
    }
    
    try {
        const user = await User.findOne({email}).select("+password");

        if(!user){
            return next(new ErrorResponse("Invalid Email", 401));
        }

        const isMatch = await user.matchPasswords(password);
        if(!isMatch){
            return next(new ErrorResponse("Wrong Password", 401));
        }

        sendToken(user, 200, res);

    } catch (error) {
        res.status(500).json({success:false, error:error.message});
    }

}

exports.forgotpassword = async (req,res,next) => {
    const {email} = req.body;

    try {
        const user = await User.findOne({ email });

        if(!user){
            return next(new ErrorResponse("Email could not be sent", 404));
        }
        const resetToken = user.getResetPasswordToken()
        await user.save();

        const resetUrl = `${process.env.URL}resetpassword/${resetToken}`;

        const message = `
        <h2>Please visit the following link to reset your password</h2>
        <a href=${resetUrl} clicktracking=off>${resetUrl}</a>`
        
        try {
            await sendEmail({
                to: user.email,
                subject: "Link to reset your password",
                text: message
            });

            res.status(200).json({success: true, data:"Email sent"});

        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save();

            return next(new ErrorResponse("Email could not be sent", 500));
        }
        
    } catch (error) {
        next(error);
    }
}

exports.resetpassword = async (req,res,next) => {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex");

    try {
        const user = await User.findOne({
            resetPasswordToken, 
            resetPasswordExpire: { $gt:Date.now() }
        });

        if(!user){
            next(new ErrorResponse("Invalid Reset Token", 400));
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(201).json({success:true, data:"Password reset successfully"});

    } catch (error) {
        next(error);
    }
}

const sendToken = (user, statusCode, res) => {
    const token = user.getSignedToken();
    res.status(statusCode).json({success:true,token});
}