import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config({path:'../.env'});

export const config = {
  aws: {
    region: process.env.AWS_REGION || "us-east-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    
  },
  port:process.env.DEV_PORT || 4000,
};
