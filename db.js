const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const filepath = "./population.db";

async function createdataset(params,callback) {
    if(!params.dishName){
        return callback({
            message:"Nutrition Name required",
        },"");
    }
    
    if(!params.category){
        return callback({
            message:"Category required",
        },"");
    }

    if(!params.productIds){
        condition["_id"]={
            $in:params.productIds.split(",")
        }
    }

    const productModel = new product(params);
    productModel.save()
    .then((response)=>{
        return callback(null,response);
    }).catch((error)=>{
        return callback(error);

    })

}