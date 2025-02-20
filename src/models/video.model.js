const mongoose = require("mongoose")
const mongooseAggregatePaginate=require("mongoose-paginate-v2")

const videoSchema= new mongoose.Schema({
    videoFile:{
        type:String,         // clound url
        require:true
    },
    thumbnail:{
        type:String,         
        require:true
    },
    title:{
        type:String,         
        require:true
    },
    description:{
        type:String,         
        require:true
    },
    duration:{
        type:Number,         
        require:true
    },
    thumbnail:{
        type:String,         
        require:true
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate)

export const Video=mongoose.model("Video",videoSchema)