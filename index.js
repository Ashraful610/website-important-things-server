const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require('dotenv').config()


const stripe = require("stripe")(process.env.MAILGUN_SECRET_KEY);

// middleware
app.use(cors());
app.use(express.json());
  
const uri =`mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.ojj3cfr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {useNewUrlParser: true,useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// -------- nodemailer and mailgun --------------------
const nodemailer = require("nodemailer");
const mg = require('nodemailer-mailgun-transport');
const auth = {
  auth: {
    api_key:`${process.env.MAILGUN_API_KEY}`,
    domain: `${process.env.MAILGUN_DOMAIN}`
  }
}
const nodemailerMailgun = nodemailer.createTransport(mg(auth));
// ----------------- email ----------------
const email = {
  from: 'mdashrafulislam.0923@example.com',
  to: 'ashalam610@gmail.com', // An array if you have multiple recipients.
  subject: 'Congratulations,Ashraful Alam!',
  //You can use "html:" to send HTML email content. It's magic!
  html: '<b>Hi , i am Md Ashraful Islam and i am from Mailgun.</b>',
  //You can use "text:" to send plain-text content. It's oldschool!
  text: 'Mailgun rocks, pow pow!'
}
 // ------------- send email api 
app.get('/email',  (req, res) =>{
  nodemailerMailgun.sendMail(email, (err, info) => {
    if (err) {
      console.log(err);
    }
    else {
      console.log(info);
    }
  });
   res.send({status: 'success'})
})

async function run() {
  console.log("Connected to MongodbClient");
  try {
    await client.connect();
    const pagesCollection = client.db("pages").collection("page");
    const usersCollection = client.db("users").collection("user");
    
    //  page er number onnojayi data load kora
    app.get("/items",async(req , res)=>{
        const page = parseInt(req.query.page);
        const query = {}
        const items = pagesCollection.find(query)
        let newItems ;
        if(page || 10){
            newItems = await items.skip(page * 10).limit(10).toArray()
        }
        else{
            newItems = await items.toArray()
        }
        res.send(newItems)
    })
     // get all items
    app.get("/pageCount", async (req, res) => {
        const pageCount = await pagesCollection.estimatedDocumentCount()
        res.send({pageCount})
    })

  //  ---------- get all user 
  app.get('/users', async (req, res) => {
     const query ={}
     const user = await usersCollection.find(query).toArray()
     res.send(user)
  })

    //  post user 
  app.post('/user', async (req, res) => {
        const user = req.body
        const result = await usersCollection.insertOne(user)
        res.send(result)
     })
    
  }
   finally {
  }
}
run().catch(console.dir);
 
app.post("/create-payment-intent", async (req, res) => {
  const items  = req.body;
  const price = items.price;
  const amount = price * 100

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "usd",
    payment_method_types:['card'],
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

app.get("/", (req, res) => {
  res.send("welcome to our pageination website");
});

app.listen(port, (req, res) => {
  console.log("listening on port " + port);
});
