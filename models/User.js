const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema=new mongoose.Schema(
    {
        firstName:{type:String, required:true},
        lastName:{type:String, required:true},
        email:{type:String, sparse: true,  default: undefined // This prevents storing null
 },
        password:{type:String,},
        cin:{type:String,required:true},
        phone:{type:String,required:true},
        address:{type:String},
        dateOfBirth:{type:Date},
        image:{type:String},
        role: { 
            type: String, 
            enum: ['patient', 'doctor', 'admin'], 
            required: true, 
            default: 'patient' 
        }, 
        fcmToken: { type: String } // Add this field to store FCM tokens

    },
    {timestamps:true}
);
UserSchema.index({ email: 1, role: 1 }, { unique: true, sparse: true });
UserSchema.index({ cin: 1, role: 1 }, { unique: true });
UserSchema.index({ phone: 1, role: 1 }, { unique: true });

// Hash password before saving
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  });



module.exports=mongoose.model("User",UserSchema)