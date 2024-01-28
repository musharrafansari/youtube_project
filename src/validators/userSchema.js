const Joi = require('joi')



const userSchem = Joi.object({
    fullName: Joi.string().required().messages({'any.required':"fullName is required"}),
    email: Joi.string().required(),  //.regex(''),
    username: Joi.string().required().min(8).max(30),
    password: Joi.string().required().min(8).max(16)  //.regex()
})


module.exports = {userSchem}