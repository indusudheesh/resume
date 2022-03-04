const express=require('express')
const adminRouter=express.Router()
const user=require('../models/User',{ useNewUrlParser: true, useUnifiedTopology: true })





adminRouter.delete('/deleteUser',async(req,res)=>{
    
    try {
        if(Object.keys(req.body).length!=0){
        const result=await user.findOneAndDelete({_id:req.body.id})
        if(result){
            res.status(200).json({message:'user removed'})
        }
        }
        else{
            res.status(406).json({message:"not acceptable.provide userId"})
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
        
    }
})







module.exports=adminRouter