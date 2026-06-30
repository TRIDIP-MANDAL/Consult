import express from 'express';
import 'dotenv/config';
import morgan from "morgan";
import { authentication } from './routes/auth.route.js';
import { feedback } from './routes/feedback.route.js';
import cookieParser from 'cookie-parser';

const app=express();
const PORT = process.env.PORT || 5100;
const NODE_ENV = process.env.NODE_ENV || "production";

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET || "any_secret_key"))
// app.use(express.urlencoded({ extended: true })); will be required when I will pass these type of data name=rahul&age=21&city=delhi


//to manage production level bugs, add proper logs ( WARN, DEBUG, ERROR, )
if (NODE_ENV === "production") {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

app.use('/auth', authentication);
app.use('/feedback', feedback);

app.listen(PORT,(err)=>{
if(!err) console.log("Server started ");
else console.log("there is an error in server",err);
})