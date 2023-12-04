const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;

// middlewares
app.use(cors({
  origin:['http://localhost:5173','https://656d9d709cf6c73047d9d660--curious-custard-2ad5b3.netlify.app'],
  credentials: true,
}))
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sykxlbw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const userCollection = client.db('inventory-management').collection('users')
    const shopCollection = client.db('inventory-management').collection('shops')
    const productCollection = client.db('inventory-management').collection('products')
    const checkOutCollection = client.db('inventory-management').collection('checkOuts')
    
    app.get('/user/admin/:email',async(req,res)=>{
      const email=req.params.email
      const query={email:email}
      const user=await userCollection.findOne(query)
      let admin=false
      if(user){
        admin=user?.user_role==="admin"
      }
      res.send({admin})
    })
    
    app.get('/user/manager/:email',async(req,res)=>{
      const email=req.params.email
      const query={email:email}
      const user=await userCollection.findOne(query)
      let manager=false
      if(user){
        manager=user?.user_role==="shop_manager"
      }
      res.send({manager})
    })

    app.delete('/checkOuts/delete/:email',async(req,res)=>{
    const email=req.params.email
    const query={email:email}
    const result=await checkOutCollection.deleteMany(query)
    res.send(result)
    })

    app.get('/checkOuts', async (req, res) => {
      const email = req.query.email
      const query = { email: email }
      const result = await checkOutCollection.find(query).toArray()
      res.send(result)
    })
    
    app.post('/checkOuts', async (req, res) => {
      const checkOutInfo = req.body
      const result = await checkOutCollection.insertOne(checkOutInfo)
      res.send(result)

    })

    app.patch('/update/products/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) };
      const updatedInfo = req.body
      const updatedDoc = {
        $set: {
          productName: updatedInfo.productName,
          productImage: updatedInfo.productImage,
          quantity: updatedInfo.quantity,
          location: updatedInfo.location,
          productionCost: updatedInfo.productionCost,
          profitMargin: updatedInfo.profitMargin,
          discount: updatedInfo.discount,
          description: updatedInfo.description,
        }
      }
      const result = await productCollection.updateOne(filter, updatedDoc)
      res.send(result)
    })
app.get('/product/:id',async (req, res) => {
  const id = req.params.id
  const query = { _id: new ObjectId(id) }
  const result = await productCollection.findOne(query)
  res.send(result)
    
})
app.delete('/products/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await productCollection.deleteOne(query)
      res.send(result)
    })

    app.get('/products', async (req, res) => {
      const email = req.query.email
      const query = { email: email }
      const result = await productCollection.find(query).toArray()
      res.send(result)
    })


    app.post('/products', async (req, res) => {
      const data = req.body
      const result = await productCollection.insertOne(data)
      res.send(result)
    })

    app.patch('/users/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) };
      const extraInfo = req.body
      const updatedInfo = {
        $set: {
          shopId: extraInfo.shopId,
          user_role: extraInfo.user_role,
          shopName: extraInfo.shopName,
          shopLogo: extraInfo.shopLogo
        }
      }
      const result = await userCollection.updateOne(filter, updatedInfo)
      res.send(result)
    })
    app.get('/users', async (req, res) => {
      const email = req.query.email
      const query = { email: email }
      const result = await userCollection.find(query).toArray()
      res.send(result)
    })
    app.post('/users', async (req, res) => {
      const userInfo = req.body
      const query = { email: userInfo.email }
      const existingUser = await userCollection.findOne(query)
      if (existingUser) {
        return res.send({ message: 'user already exist', insertedId: null })
      }
      const result = await userCollection.insertOne(user)
      res.send(result)
    })
   
    app.post('/shops', async (req, res) => {
      const user = req.body
      const query = { email: user.email }
      const existingUser = await shopCollection.findOne(query)
      if (existingUser) {
        return res.send({ message: 'user already exist', insertedId: null })
      }
      const result = await shopCollection.insertOne(user)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('server is running')
})

app.listen(port, () => {
  console.log(`server is running on ${port}`)
})