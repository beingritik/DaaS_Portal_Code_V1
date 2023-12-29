const express = require('express');
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.set('views', __dirname + "/views");


app.get("/", (req, res)=>{
    res.render('index')
})

app.get('/login', (req, res)=>{
    res.render('pages/login')
})

app.get('/form', (req, res)=>{
    res.render('pages/userGroupAssign')
})

app.get('/table',(req, res)=>{
    res.render('pages/table')
})
const  PORT = process.env.PORT || 3000;

app.listen(PORT, function(){
    console.log("Connecting on ", PORT)
})  


