import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" })); // this let limit of 16kb on incomming json for security reasons
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // for url makes it nested and limit 16 kb
app.use(express.static("public")); //for local file accessing
app.use(cookieParser()); //for cookies saving things on browser config

export { app };
