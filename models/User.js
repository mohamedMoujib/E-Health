const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema=new mongoose.Schema(
    {
        firstName:{type:String, required:true},
        lastName:{type:String, required:true},
        email:{type:String, unique:true},
        password:{type:String,},
        cin:{type:String,required:true, unique:true},
        phone:{type:String,required:true, unique:true},
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


// Hash password before saving
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  });



module.exports=mongoose.model("User",UserSchema)