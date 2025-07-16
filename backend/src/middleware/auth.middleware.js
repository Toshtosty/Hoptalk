import jwt from 'jsonwebtoken';
// import User from '../models/user.model.js';
import User from '../models/user.js';
// filepath: c:\Users\TOSHITA\Desktop\Snugchat\backend\src\middleware\auth.middleware.js

export const protectRoute =async(req, res, next) => {
    try{
        const token=req.cookies.jwt;

        if(!token){
            return res.status(401).json({message:"Not authorized, no token provided"});
        }

        const decode=jwt.verify(token, process.env.JWT_SECRET_KEY);
        if(!decode){
            return res.status(401).json({message:"Not authorized,invalid token "});
        }

        const user=await User.findById(decode.userId).select("-password");
        if(!user){
            return res.status(401).json({message:"Not authorized, user not found"});
        }

        req.user=user;
        next();//goes to onboard
    }
    catch(error){
        console.log(" error in auth middleware", error);
        return res.status(500).json({message:"Internal server error"});
        
    }

}

