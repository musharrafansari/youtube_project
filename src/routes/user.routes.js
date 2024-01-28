// import { Router } from "express";
const express=require("express")
const {registerUser} =require("../controller/user.controller.js")
const {upload}=require("../middlewares/multer.middleware.js")


const router=express.Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ])  ,                              // may be single file or multiple file-fields
    registerUser)   

// router.post("/register",upload.single('file'),registeruser.registerUser)

module.exports = router