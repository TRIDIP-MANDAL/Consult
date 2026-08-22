import express from 'express';
import {initiateTrnsctn, verifyTrnsctn, callbackUrlResponder} from "../controller/payment.controller.js"
const paymentRoute = express.Router();

paymentRoute.post("/initiate",initiateTrnsctn); // required to add applicable middlewares
paymentRoute.get("/verify",verifyTrnsctn);
paymentRoute.post("/callback",callbackUrlResponder);

export default paymentRoute;