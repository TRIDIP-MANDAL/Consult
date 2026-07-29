import express from 'express';
import {S3Client, PutObjectCommand} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { userRoute, protect } from '../middleware/protectRoute.js';
import crypto from 'crypto';
const imageRoute = express.Router();

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

imageRoute.post('/upload-url', protect, userRoute, async (req, res)=>{
   try {
    const { contentType, fileName } = req.body;

    const fileKey = `${crypto.randomUUID()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

   return res.status(200).json({
      url: signedUrl,
      fileKey: fileKey,
    });
  } catch (error) {
    console.error("Error generating URL:", error);
    return res.status(500).json({ error: "Failed to generate upload URL" });
  }
})
export default imageRoute;