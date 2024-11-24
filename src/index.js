require('dotenv').config();


// import mongoose from "mongoose";
// import { DB_NAME } from "./constants.js";
// import  express from "express"
const mongoose=require("mongoose")
const DB_NAME=require("./constants")
const express=require("express")
const cors = require('cors')
const cookieParser = require('cookie-parser')
const userRouter=require("./routes/user.routes.js")


const app=express()

// /  first approach to connect db in index js file

  // console.log("====>",process.env.MONGO_URI)


// ----------------

//
//
const swaggerUi = require('swagger-ui-express');
const YAML= require("yamljs")
const swaggerJsdoc = YAML.load("./api.yaml")

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJsdoc));

// const options = {
//   definition: {
//     openapi: '3.0.0',
//     info: {
//       title: 'Youtube System',
//       version: '1.0.0',
//       description: 'Youtube System covered Create, Read, Update, and Delete operations using a Node.js API',
//     },
//     servers:[
//       {url:'http://localhost:5000'}, //you can change you server url
//     ],
//   },

//   apis: ['./routes/*user.routes.js'], //you can change you swagger path
// };

// const specs = swaggerJsdoc(options);



//-----------------

async function connectToMongoDB() {
  try {
   
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: false,
      useUnifiedTopology: false,
    });

    console.log('Connected to MongoDB==========>');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    // You may choose to throw the error or handle it in another way based on your application's needs
  }
}

// Call the function to connect to MongoDB
connectToMongoDB()
.then(()=>{
  app.listen(process.env.PORT|| 3000, () => {
      console.log(`server running on port=======> ${process.env.PORT}`);
    })
})
.catch((err)=>{
  console.log("mongodb connection falied",err)
})


///////======================>

// async function connectToMongoDB() {
//   try {
//     await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     console.log('Connected to MongoDB');
//   } catch (error) {
//     console.error('Error connecting to MongoDB:', error.message);
//     // Terminate the application if the connection to MongoDB fails
//     process.exit(1);
//   }
// }

// // Wrap the server start in the connectToMongoDB function
// async function startServer() {
//   await connectToMongoDB();

  // app.listen(process.env.PORT || 3000, () => {
  //   console.log(`Server running on port ${process.env.PORT || 3000}`);
  // });
// }

// Call the function to start the server
// startServer();



app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))

app.use(express.static("public"))
app.use(cookieParser())


// route declration 

app.use("/users",userRouter)
  

//

//   app.use("/",route)
app.get("/test", (req, res) => {
  res.status(200).send("message sent successfully.");
});

app.get("/user",(req,res)=>{
  const obj={id:1,name:"Musharraf"}
  res.status(200).send(obj)
})

let users=[
  {id:1,name:"Musharraf"},
  {id:2,name:"Asif"},
  {id:3,name:"Saif"},
]
app.get("/test/user",(req,res)=>{
  // const obj={id:1,name:"Musharraf"}
  res.status(200).send(users)
})

app.get("/users/:id",(req,res)=>{
  let obj= users.find((x)=>x.id===parseInt(req.params.id))
  res.status(200).send(obj)
})

app.listen(process.env.PORT || 3000, () => {
  console.log(`server running on port ${process.env.PORT}`);
});




