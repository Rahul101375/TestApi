import Joi from 'joi'
import CustomeErrorHandler from '../../services/CustomeErrorHandler';
import {RefreshToken, User} from '../../models';
import bcrypt from 'bcrypt'
import JwtService from '../../services/JwtService'
import { REFRESH_SECRET } from '../../config';

const registerController={
  async  register(req,res,next){
    // write here logic for register

    // Validation
    const registerSchema=Joi.object({
        name:Joi.string().min(3).max(30).required(),
        email:Joi.string().email().min(8).max(50).required(),
        password:Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}')).required(),
        repeat_password:Joi.ref('password')
    })

    const {error}=registerSchema.validate(req.body);
    if(error){
        // here validation error
        return next(error)
        // res.json({})
    }

    // check Email Existence
    try{
         const exist=await User.exists({email:req.body.email})
         if(exist){
            //  here create custom error 
             return next(CustomeErrorHandler.alreadyExist('This email is already exists'));
         }
    }
    catch(err){

        return next(err)
    }

    const {name,email,password}=req.body

    // hash password
    const salt = await bcrypt.genSalt(10)
    const hashPassword= await bcrypt.hash(password,salt)

    // prepear model
    const user=new User({
        name,
        email,
        password:hashPassword
    })

    let access_token;
    let refresh_token;
    try{
        const result=await user.save()

        // Token
        access_token=JwtService.sign({_id:result._id,role:result.role})
        refresh_token=JwtService.sign({_id:result._id,role:result.role},'1y',REFRESH_SECRET)

        // database whitelist
        await RefreshToken.create({'token':refresh_token})

    }
    catch(err){
        return next(err)
    }

    res.json({'access_token':access_token,refresh_token})
    }
}

export default registerController