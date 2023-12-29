const mongoose =require('mongoose');

var userSchema = mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique : true
    },
    userGroup:{
        type:[String],
        required:true
    },
    role:{
        type:String,
        required:true,
        enum:['admin', 'manager', 'user'],
        default:"user"
    }
}
// {versionKey: 'versionKey' }
)


const datab =  new mongoose.model("user",userSchema);
module.exports= datab;