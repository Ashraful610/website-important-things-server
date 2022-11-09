const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());
  
const uri =
  "mongodb+srv://web-dev-phero:EZHDICmFfDvNSMqY@cluster0.ojj3cfr.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {useNewUrlParser: true,useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// -------- nodemailer and mailgun --------------------
const nodemailer = require("nodemailer");
const mg = require('nodemailer-mailgun-transport');
const auth = {
  auth: {
    api_key:'5a947b8796efd5beb1a9b63c260fdbe2-8845d1b1-6ce64d21',
    domain: 'sandbox0ff7daad1a7c4d90adc7e1c30dfc436a.mailgun.org'
  }
}
const nodemailerMailgun = nodemailer.createTransport(mg(auth));

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

app.get("/", (req, res) => {
  res.send("welcome to our pageination website");
});

app.listen(port, (req, res) => {
  console.log("listening on port " + port);
});
