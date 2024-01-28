// class ApiError extends Error{
//     constructor(
//         statusCode,
//         message="Something went wrong",
//         errors=[],
//         stack=""
//     ){
//         super(message)
//         this.statusCode=statusCode
//         this.data=null
//         this.message=message
//         this.success=false
//         this.errors=errors

//         if(stack){
//             this.stack=stack
//         }else{
//             Error.captureStackTrace(this,this.constructor)
//         }
//     }
// }

class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message);  // Corrected order, super() should come first

        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        this.errors = errors;
        this.message = message;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }

        // You can place the console.log statement here if needed
        console.log("I am from constructor");
    }
}

module.exports = {
    ApiError:ApiError
};

