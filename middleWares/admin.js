import { User } from "../models"
import CustomeErrorHandler from "../services/CustomeErrorHandler";

const admin=async(req,res,next)=>{
    try{
        const user=await User.findOne({_id:req.user._id})
        if(user.role==='admin'){
            next();
        }
        else{
            return next(CustomeErrorHandler.unAuthorized())
        }
    }
    catch(err){
        return next(CustomeErrorHandler.serverError())
    }
}

export default admin