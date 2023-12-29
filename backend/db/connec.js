
const mongoose = require('mongoose');
// "mongodb+srv://ritikj:pass%40123@cluster-test.d2rtmbm.mongodb.net/New?retryWrites=true&w=majority"
mongoose.connect("mongodb://10.2.8.200:27017/userData", {
      useNewUrlParser:true,
      useUnifiedTopology:true
}).then(()=>{
    console.log('connection successful in mongo db.');
}).catch((err)=>{
    console.log("no connection:", err);
    // end();
});

module.exports=mongoose.connection;