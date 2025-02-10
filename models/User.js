const mongoose = require("mongoose");

const UserSchema=new mongoose.Schema(
    {
        firstName:{type:String, required:true},
        lastName:{type:String, required:true},
        email:{type:String, unique:true},
        password:{type:String,},
        cin:{type:String,required:true, unique:true},
        telephone:{type:String,required:true, unique:true},
        address:{type:String},
        dateOfBirth:{type:Date},
        image:{type:String},
        role: { 
            type: String, 
            enum: ['patient', 'doctor', 'admin'], 
            required: true, 
            default: 'patient' 
        }, 

    },
    {timestamps:true}
);

module.exports=mongoose.model("User",UserSchema)