import express from "express";
import path from 'path'
import  mongoose from "mongoose";
import { APP_PORT,DB_URL } from "./config";
import errorHandler from "./middleWares/errorHandler";
import cors from 'cors'
const app=express()
app.use(express.json())
import routes from './routes'

mongoose.connect(DB_URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    // useFindAndModify:false
})
const db=mongoose.connection
db.on('error',console.log.bind(console,'connection error:'));
db.once('open',()=>{
    console.log('DB Connected...')
})
global.appRoot=path.resolve(__dirname)
app.use(express.urlencoded({extended:false}))
app.use(cors())
app.use('/api',routes)
app.use('/uploads',express.static('uploads'))

app.use(errorHandler)
app.listen(APP_PORT,()=>{console.log(`Listening on port ${APP_PORT}`)})