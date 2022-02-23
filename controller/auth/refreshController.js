import Joi from "joi"
import { REFRESH_SECRET } from "../../config"
import { RefreshToken, User } from "../../models"
import CustomeErrorHandler from "../../services/CustomeErrorHandler"
import JwtService from "../../services/JwtService"

const refreshController={
    async refresh(req,res,next){
        // validate
        const refreshSchema=Joi.object({
            refresh_token:Joi.string().required()
        })
        const {error}=refreshSchema.validate(req.body)
        if(error){
            return next(error)
        }

        // database
        let refreshToken
        let userId
        try{
           refreshToken=await RefreshToken.findOne({token:req.body.refresh_token})
           if(!refreshToken){
               return next(CustomeErrorHandler.unAuthorized('Invalid refresh token'))
           }
           try{
               const {_id} = await JwtService.verify(refreshToken.token,REFRESH_SECRET)
               userId=_id
           }
           catch(err){
               return next()
           }

           const user=await User.findOne({_id:userId})
           if(!user){
               return next(CustomeErrorHandler.unAuthorized('No User found'))
           }

           const access_token=JwtService.sign({_id:user._id,role:user.role})
           const refresh_token=JwtService.sign({_id:user._id,role:user.role},'1y',REFRESH_SECRET)

           await RefreshToken.create({token:refresh_token})
           res.json({access_token,refresh_token})
        }
        catch(error){
            return next(new Error('Something went wrong' + error.message))
        }
    }
}

export default refreshController