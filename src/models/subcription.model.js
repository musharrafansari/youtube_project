const mongoose=require("mongoose")

const subscriptionSchema=mongoose.model({
    subcriber:{
        type:mongoose.Schema.Types.ObjectId,  // one who is subcribing(user)
        ref:"user"
    },
    channel:{
        type:mongoose.Schema.Types.ObjectId,  // one to whom subscriber is ubscribing
        ref:"user"
    },
},

    {timestamps:true}
)

module.exports=mongoose.model("Subscription",subscriptionSchema)