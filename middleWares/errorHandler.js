import { DEBUG_MODE } from "../config";
import { ValidationError } from "joi";
import CustomeErrorHandler from "../services/CustomeErrorHandler";
const errorHandler=(err,req,res,next)=>{
    // here first parametere is recived from next parameter data and 4th parametr if you want to send other we use next
    let statusCode=500;

    let data={
        message:'Internal server error',
        // originalError:err.message  //it is not good for production mode we apply something for production(DEBUG_MODE)
        ...(DEBUG_MODE === 'true' && {
            originalError:err.message
        })
    }

    if(err instanceof ValidationError){
        statusCode=400
        data={
            message:err.message
        }
    }

    if(err instanceof CustomeErrorHandler){
        statusCode=err.status;
        data={
            message:err.message
        }
    }
    return res.status(statusCode).json(data)
}

export default errorHandler