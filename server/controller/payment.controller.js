// const https = require('https');
/*
* import checksum generation utility
* You can get this utility from https://paytmpayments.com/docs/checksum/
* Generate checksum by parameters we have in body
* Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytmpayments.com/next/apikeys 
*/
//  https://securestage.paytmpayments.com/theia/api/v1/initiateTransaction?mid={mid}&orderId={order-id}

// 1. The API Endpoints
// For Testing (Staging Environment):
// [https://securestage.paytmpayments.com/theia/api/v1/initiateTransaction?mid=](https://securestage.paytmpayments.com/theia/api/v1/initiateTransaction?mid=){YOUR_MID}&orderId={YOUR_ORDER_ID}

// For Live (Production Environment):
// [https://secure.paytmpayments.com/theia/api/v1/initiateTransaction?mid=](https://secure.paytmpayments.com/theia/api/v1/initiateTransaction?mid=){YOUR_MID}&orderId={YOUR_ORDER_ID}

// import { type } from 'os';
import prisma from '../model/db.js';
import PaytmChecksum from 'paytmchecksum';

const mid = process.env.MID.trim();
const mkey = process.env.MKEY.trim();

const initiateTrnsctn = async (req, res) => {
    const orderId = "ORDERID_" + Date.now();

    var paytmParams = {};

    paytmParams.body = {
        "requestType": "Payment",
        "mid": mid,
        "websiteName": "DIYtestingweb",
        // "websiteName": "WEBSTAGING", // for testing
        // "websiteName": ""Vriddhi"",
        "orderId": orderId,
        // this callback url is an url (ngrok + api made by me ), when the payment will be completed (success, failure, freeze ) paytm will call this api for server to server comminucation and send me the payment details
        "callbackUrl": "https://merchant.com/callback",
        // "callbackUrl": "http://localhost:5100/payment/callback",
        "txnAmount": {
            "value": "1.00", // take it from backend
            "currency": "INR",
        },
        "userInfo": {
            "custId": "CUST_001", // will take from body
        },
    };
    //value and currency need to be calculated from DB


    try {
        const chksum = await PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), mkey);
        paytmParams.head = {
            "signature": chksum
        }
        console.log("Cheksym gnrtd ", chksum);
        // const post_data = JSON.stringify(paytmParams);
        // const options = {
        //     hostname: 'securestage.paytmpayments.com',
        //     /* for Production */
        //     // hostname: 'secure.paytmpayments.com',
        //     port: 443,
        //     path: `/theia/api/v1/initiateTransaction?mid=${mid}&orderId=${orderId}`,
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Content-Length': post_data.length
        //     }
        // };

        const response = await fetch(`https://securestage.paytmpayments.com/theia/api/v1/initiateTransaction?mid=${mid}&orderId=${orderId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paytmParams)
        });
        console.log("REASON PHRASE => ", response.statusText)
        const data = await response.json();
        console.log("PAYTM RESPONSE => ", data);
        //2. api call to paytm's server for initiating the payment will give us the txnToken
        // before sending the response need to write in DB

        return res.status(200).json({
            success: true,
            message: "transaction initiated",
            orderId: orderId,
            txnToken: null // need to be picked up by seeing the value of data variable
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
    // core logic 1. chksm_gen 2. send the orderId (we will get it from api call to paytm) and txnToken

}

const verifyTrnsctn = async (req, res) => {
    const https = require('https');
    /**
    * import checksum generation utility
    * You can get this utility from https://paytmpayments.com/docs/checksum/
    */
    const PaytmChecksum = require('./PaytmChecksum');

    /* initialize an object */
    var paytmParams = {};

    /* body parameters */
    paytmParams.body = {

        /* Find your MID in your Paytm Dashboard at https://dashboard.paytmpayments.com/next/apikeys */
        "mid": "YOUR_MID_HERE",

        /* Enter your order id which needs to be check status for */
        "orderId": "YOUR_ORDER_ID",
    };

    /**
    * Generate checksum by parameters we have in body
    * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytmpayments.com/next/apikeys 
    */
    PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), "YOUR_MERCHANT_KEY").then(function (checksum) {
        /* head parameters */
        paytmParams.head = {

            /* put generated checksum value here */
            "signature": checksum
        };

        /* prepare JSON string for request */
        var post_data = JSON.stringify(paytmParams);

        var options = {

            /* for Staging */
            hostname: 'securestage.paytmpayments.com',

            /* for Production */
            // hostname: 'secure.paytmpayments.com',

            port: 443,
            path: '/v3/order/status',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': post_data.length
            }
        };

        // Set up the request
        var response = "";
        var post_req = https.request(options, function (post_res) {
            post_res.on('data', function (chunk) {
                response += chunk;
            });

            post_res.on('end', function () {
                console.log('Response: ', response);
            });
        });

        // post the data
        post_req.write(post_data);
        post_req.end();
    });

}

const callbackUrlResponder = async (req, res) => { // here need to be applied security layer, like only paytm can call this api
    try {  // what if I write every api response with try, catch, finally 
        console.log("callbackUrl responder is being hit by paytm ");
        const paytmResp = req.body;

        //server to server communication will happen here. 
        const isValidSgntre = PaytmChecksum.verifySignature(paytmResp, mkey, paytmResp.CHECKSUMHASH);

        if (isValidSgntre && paytmResp.STATUS === "TXN_SUCCESS") {
            // write in DB
            console.log('transcation is done withe orderId ', paytmResp.ORDERID);
        }
        else {
            throw new Error("Custom error for not succcessful transcation"); // shall go to catch block
        }
        return res.status(200).json()
    } catch (error) {
        console.log("error in calbackUrl");
    }

}

export { initiateTrnsctn, verifyTrnsctn, callbackUrlResponder };