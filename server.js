require("dotenv").config();
const express = require("express");
const cors =require('cors');
require('./config/dbConnecation.js')
const bodyParser= require('body-parser')


//Router 
const userRouter = require('./routes/userRouter.js')
 const webRouter = require('./routes/webRouter.js')

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));


// Set the view engine and views directory
app.set('view engine', 'ejs'); // Assuming you're using EJS
app.set('views', './views'); // Adjust the directory path as per your project structure

// Middleware to serve static files from the 'public' directory
app.use(express.static('public'));

app.use('/api',userRouter);
 app.use('/',webRouter);

//error handle 
app.use((err,req,res,next)=>{
    err.statusCode =err.statusCode || 500;
    err.message= err.message || "Internal Server Error";
    res.status (err.statusCode).json({
        message:err.message,
    });
});

const port =  process.env.PORT || 5000;

app.listen(port, ()=>  console.log(`Server Pport is running ${port}`));