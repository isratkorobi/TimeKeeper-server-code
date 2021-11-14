const express = require("express");
const { MongoClient } = require("mongodb");
require('dotenv').config();
const cors = require('cors');
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n211q.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db('timeKeeper');
    const productsCollection = database.collection('products');
    const orderCollection = database.collection('order');
    const reviewCollection = database.collection('review');
    const userCollection = database.collection('user');

    // GET API
    app.get('/products',async(req,res)=>{
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    })


    // POST API
    app.post('/products', async(req,res)=>{
      const product = req.body;
      console.log('hit the post api',product);

      const result = await productsCollection.insertOne(product);
      console.log(result);
      res.send(result);
    });

    app.get("/singleproducts/:id", async (req,res)=>{
      console.log(req.params.id);
      const result = await productsCollection.find({_id:ObjectId(req.params.id)}).toArray(); 
      res.send(result[0]);
    })

    // insert order
    app.post("/addOrders", async(req,res)=>{
      const result = await orderCollection.insertOne(req.body);
      res.send(result);           
    
    })

    // my Order

    app.get("/myOrder/:email",async(res,req)=>{
      const result = await orderCollection.find({email:req.params.email}).toArray();
      res.send(result);
    });
    // POst review
    app.post("/addSReview",async(req,res)=>{
      const result = await reviewCollection.insertOne(req.body);
      res.send(result);
    })
    // get service
    app.get("/allReview",async(req,res)=>{
      const result = await reviewCollection.find({}).toArray();
      res.json(result);
    })
    app.post("/addUserInfo", async (req, res)=>{
      console.log("req.body");
      const result = await userCollection.insertOne(req.body);
      res.send(result)
    })
    app.put("/makeAdmin", async(req, res)=>{
      const filter = {email: req.body.email};
      const result = await userCollection.find(filter).toArray();
      if(result){
        const documents = await userCollection.updateOne(filter,{
          $set: {role: "admin"},
        });
        res.json(documents)
      }else{
        res.json()
      }
     
    })

    app.get("/checkAdmin/:email", async (req, res)=>{
      const result = await userCollection
      .find({email: req.params.email})
      .toArray();
      console.log(result);
      res.send(result);
    })
  }
 
   finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running my CRUD Server");
});

app.listen(port, () => {
  console.log("Running Server on port", port);
});
