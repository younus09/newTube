import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config();

import connectDB from "./db/index.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is Running on PORT ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Mongo Db Connection Failed !!. `, err);
  });

/*
1st approch

//this is commented because the lower code is making the index.js  polluted 


import express from "express";
const app = express();

(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

    app.on("error", (error) => {
      // this is used because you dont want torun the program if by chance your app has thrown error and not working
      console.log("Error : ", error);
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log(`App is Listening on Port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log("Error : ", error);
  }
})();
*/
