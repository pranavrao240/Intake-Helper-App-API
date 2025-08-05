// function errorHandler(err,req,res,next) {
//     if(typeof err ===  "string"){
//         return res.status(400).json({message:err});
//     }

//     if(err.name === "ValidationError"){
//         return res.status(400).json({message:err.message});
//     }
//     if(err.name === "UnauthorizedError"){
//         return res.status(400).json({message:"Token Not valid"});
//     }
    
//     return res.status(500).json({message:err.message});
   
    
// }

// module.exports ={
//     errorHandler,
// };

function errorHandler(err, req, res, next) {
    // Log the error details for debugging purposes
    console.error(err);

    // Handle string error (for custom error messages)
    if (typeof err === "string") {
        return res.status(400).json({
            success: false,
            message: err,
        });
    }

    // Handle ValidationError (Mongoose or other schema validation)
    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }

    // Handle UnauthorizedError (e.g., invalid JWT)
    if (err.name === "UnauthorizedError") {
        return res.status(401).json({
            success: false,
            message: "Token not valid",
        });
    }

    // Handle general errors (fallback)
    return res.status(500).json({
        success: false,
        message: err.message || "Something went wrong",
    });
}

module.exports = {
    errorHandler,
};
