import joi from 'joi'
import CustomeErrorHandler from "../../services/CustomeErrorHandler";
import bcrypt from 'bcrypt'
import JwtService from '../../services/JwtService'
import {RefreshToken,User} from "../../models";
import { REFRESH_SECRET } from "../../config";
import Joi from "joi";

const loginController={
    // validate
    async login(req,res,next){
       const loginSchema=joi.object({
        email:joi.string().email().min(8).max(50).required(),
        password:joi.string().min(8).pattern(new RegExp('^[a-zA-Z0-9]{3,30}')).required()
       })
       const {error}= loginSchema.validate(req.body)
       if(error){
           return next(error)
       }

       try{
        const user=await User.findOne({email:req.body.email})
        if(!user){
            return next(CustomeErrorHandler.emailNotFound("Email not found"))
        }
        const match=await bcrypt.compare(req.body.password,user.password)
        if(!match){
            return next(CustomeErrorHandler.emailNotFound("Invalid password !"))
        }

        // Token
        const access_token=JwtService.sign({_id:user._id,role:user.role})
       const refresh_token=JwtService.sign({_id:user._id,role:user.role},'1y',REFRESH_SECRET)

        // database whitelist
        await RefreshToken.create({'token':refresh_token})

        res.json({access_token,refresh_token})
       }
       catch(err){
           return next(err)
       }
    },

  async logout(req,res,next){

    // validation
    const refreshSchema=Joi.object({
        refresh_token:Joi.string().required()
    })

    const {error}=refreshSchema.validate(req.body)

    if(error){
        return next(error)
    }


      try{
           await RefreshToken.deleteOne({token:req.body.refresh_token})
      }
      catch(err){
          return next(new Error('Something went wrong in the database'))
      }
      res.json({"status":200})
    }

}

export default loginController