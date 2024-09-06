const port = process.env.PORT || 4000;
const express = require('express')
const app = express();
const mongoose = require("mongoose"); //use mongodb database 
const jwt = require("jsonwebtoken"); // generate token and verify 
const multer = require("multer"); // create image storage system
const path = require('path');
const cors = require("cors");
const exp = require('constants');
const { type } = require('os');

app.use(express.json());
app.use(cors());

// connection with database

mongoose.connect("mongodb+srv://Mechcodes:Raudra_rtr24@cluster0.4g5cm.mongodb.net/e-commerce");

//API creation 

app.get("/",(req,res)=>{
    res.send("Express running ")
})

// Image storage

const storage = multer.diskStorage({
    destination: './upload/images',
    filename:(req,file,cb)=>{
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }

})

const upload = multer({storage:storage});

// creating upload endpoint for images

app.use('/images',express.static('upload/images'));

app.post('/upload',upload.single('product'),(req,res)=>{
    res.json({
        success:1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    })
})

// Schema for add product database model.

const Product = mongoose.model("Product",{
    id:{
        type:Number,
        required:true
    },
    name:{
        type: String,
        required: true  
    },
    image:{
        type: String,
        required:true
    },
    category:{
        type: String,
        required:true
    },
    new_price:{
        type:Number,
        required:true
    },
    old_price:{
        type:Number,
        required:true
    },
    date:{
        type:Date,
        default:Date.now
    },
    available:{
        type:Boolean,
        default:true
    },

})

//API for adding in moongoose.

app.post("/addproduct", async (req, res) => {
    try {
      // Fetch all products to determine the new product ID
      let products = await Product.find({});
  
      let id;
      if (products.length > 0) {
        let last_product = products[products.length - 1]; // Get the last product directly
        id = last_product.id + 1;
      } else {
        id = 1;
      }
  
      // Create a new product instance
      const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
      });
  
      console.log(product);
  
      // Save the product to the database
      await product.save();
  
      console.log("Saved");
  
      // Send success response
      res.json({
        success: true,
        name: req.body.name,
      });
    } catch (error) {
      console.error("Error saving product:", error.message); // Log the error for debugging
  
      // Send error response
      res.status(500).json({
        success: false,
        message: "Failed to add product to the database.",
        error: error.message, // Optionally include the error message for more detailed feedback
      });
    }
  });
  

// Remove product form database

app.post("/removeproduct",async (req,res)=> {
    await Product.findOneAndDelete({id:req.body.id})
    console.log("Removed");

    res.json({
        success:true,
        name:req.body.name
    })
})

// Show all products in dataBase.

app.get('/allproduct', async (req,res)=>{
    let product = await Product.find({});
    console.log("All products fetched");
    res.send(product);
})

// show all recent added products

app.get('/newcollections',async(req,res)=>{
   let products= await Product.find({});
   let newcollection = products.slice(1).slice(-8);
   console.log("New Collection fetched");
   res.send(newcollection);
})

// Popular in women api

app.get('/popularinwomen',async(req,res)=>{
    let product = await Product.find({category:"women"});
    let data = product.slice(0,4);
    console.log("Popular in women fetched");
    res.send(data);
})

//creating middleware to fetch user

const fetchUser = async(req,res,next)=>{
    const token = req.header("auth-token")
    
    if (!token) {
        res.status(401).send({error:"Please authenticate using valid token"})
    }else{
        try {
            const data = jwt.verify(token,'secret_ecom');
            req.user=data.user;
            next();
        } catch (error) {
            res.status(401).send({error:"Please authenticate using valid token"});
        } 
    }

}

// creating endpoint for adding product in cart data

app.post('/addtocart',fetchUser,async(req,res)=>{
    // console.log(req.body,req.user);
    let userData = await Users.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId]+=1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    // console.log(userData);
    res.send("Added")
})

app.post("/removefromcart",fetchUser,async(req,res)=>{
    let userData = await Users.findOne({_id:req.user.id});
    if(userData.cartData[req.body.itemId]>0)
        userData.cartData[req.body.itemId]-=1;
    
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    // console.log(userData);
    res.send("Removed")
})

//creating endpoint to show all product in cart after login

app.post('/getcart',fetchUser,async(req,res)=>{
    let userData = await Users.findOne({_id:req.user.id});
    res.json(userData.cartData); 
})


// Schema for addUSer

const Users = mongoose.model("users",{
    username:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now,
    }
})

// Creating endpoint for resgistering the user

app.post("/signup",async (req,res)=>{

    let check = await Users.findOne({email:req.body.email});

    if(check){
        return (
            
            res.status(400).json({success:false,error:"User already exist, Please Login"})      
        )
    }
    
    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i] = 0;
        
    };
    const user = new Users({
        username:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData: cart,

    })
        await user.save();

        const data = {
            user:{
                id:user.id
            }
        }

        const token = jwt.sign(data,'secret_ecom');
        
        res.json({
            success:true,
            token});
}
)

// creating end point for user login.

app.post("/login",async(req,res)=>{
    
    let user = await Users.findOne({email:req.body.email});
    if (user) {
        // console.log("email aayi kya",{email:req.body.email});
        const passcompare = req.body.password === user.password;
    if (passcompare) {
        const data={
            user:{
                id:user.id
            }   
        }
        const token = jwt.sign(data,'secret_ecom');
        res.json({success:true,token});
    }else{
        res.json({sccess:false,errors:"Wrong Password"});
        }
    
    }else{
        console.log("nhi aayi email",{email:req.body.email});
        res.json({success:false,errors:"Wrong email Id"})
    }
})

app.listen(4000,(error)=>{
    if(!error){
        console.log("Express is Runnning on port "+port);
    }else{
        console.log("Error: "+error);
    }
})