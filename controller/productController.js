import { Product } from "../models"
import multer from "multer";
import path from 'path'
import CustomeErrorHandler from "../services/CustomeErrorHandler";
import Joi from "joi";
import fs from 'fs'
import productSchema from "../validators/productValidator";

const storage=multer.diskStorage({
    destination:(req,file,cb)=>cb(null,'uploads/'),
    filename:(req,file,cb)=>{
        const uniqueName=`${Date.now()}-${Math.round()*1E9}${path.extname(file.originalname)}`
        cb(null,uniqueName);
    }
})

const handleMultiPartData=multer({storage,limits:{fileSize:1000000*5}}).single('image')  //5MB

const productController={
    async store(req,res,next){
        handleMultiPartData(req,res,async(err)=>{
            if(err){
                return next(CustomeErrorHandler.serverError(err.message))
            }
            console.log(req.file)
            const filePath=req.file.path

            // validation
            // const productSchema=Joi.object({
            //     name:Joi.string().required(),
            //     price:Joi.number().required(),
            //     size:Joi.string().required()
            // })

            const {error}=productSchema.validate(req.body)
            if(error){
                // delete upload image
                fs.unlink(`${appRoot}${filePath}`,(err)=>{
                    if(err){
                        return next(CustomeErrorHandler.serverError(err.message))                    
                    }
                })
                //rootfolder/uploads/filename.png
                return next(error)
            }

            const {name,price,size}=req.body
            let document;
            try{
                document=await Product.create({
                    name,
                    price,
                    size,
                    image:filePath
                })
            }catch(err){
                return next(err)
            }
            res.status(201).json(document)
        })
    },

    async update(req,res,next){
        handleMultiPartData(req,res,async(err)=>{
            if(err){
                return next(CustomeErrorHandler.serverError(err.message))
            }
            let filePath;
            if(req.file){
                console.log(req.file)
                filePath=req.file.path
            }

            // validation
            // const productSchema=Joi.object({
            //     name:Joi.string().required(),
            //     price:Joi.number().required(),
            //     size:Joi.string().required()
            // })

            const {error}=productSchema.validate(req.body)
            if(error){
                // delete upload image
               if(req.file){
                fs.unlink(`${appRoot}${filePath}`,(err)=>{
                    if(err){
                        return next(CustomeErrorHandler.serverError(err.message))                    
                    }
                })
               }
                //rootfolder/uploads/filename.png
                return next(error)
            }

            const {name,price,size}=req.body
            let document;
            try{
                document=await Product.findOneAndUpdate({_id:req.params.id},{
                    name,
                    price,
                    size,
                    ...(req.file && {image:filePath})
                    // image:filePath
                },{new:true})
                console.log(document)
            }catch(err){
                return next(err)
            }
            res.status(201).json(document)
        })
    },
    async destroy(req,res,next){
        const document=await Product.findByIdAndRemove({_id:req.params.id});
        if(document){
            return next(new Error('Nothing to delete'))
        }
        // Image delete
        const imagePath=document._doc.image;

        // const imagePath=document.image; its give whole path url  
        console.log(imagePath)
        fs.unlink(`${appRoot}/${imagePath}`,(err)=>{
            if(err){
                return next(CustomeErrorHandler.serverError())
            }
           return res.status(201).json(document)
        })
        // res.status(201).json(document) its happen bcz of get method to add
    },
   async index(req,res,next){
       let document
    //    pagination for 1000 above data(mongoPagenation)
       try{
           document=await Product.find().select('-updatedAt -__v').sort({_id:-1});//desc
       }catch(err){
           return next(CustomeErrorHandler.serverError())
       }
       res.status(200).json(document)
   },
   async show(req,res,next){
       let document
       try{
           document=await Product.findOne({_id:req.params.id}).select('-updatedAt -__v')
       }catch(err){
           return next(CustomeErrorHandler.serverError())
       }
       res.status(201).json(document)
   }
}
export default productController;