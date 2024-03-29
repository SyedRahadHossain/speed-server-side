const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.byllt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });




async function run() {
  try {
    await client.connect();
    //   console.log('connected to database');
    const database = client.db('speed');
    const productsCollection = database.collection('products');
    const ordersCollection = database.collection('orders');
    const reviewsCollection = database.collection('reviews');
    const usersCollection = database.collection('users');



    // GET PACKAGES API
    app.get('/products', async (req, res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    })

    // GET Single Package
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      console.log('getting specific package', id);
      const query = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(query);
      res.json(product);
    })

    // POST API
    app.post('/products', async (req, res) => {
      const product = req.body;
      console.log('hit the post api', product);

      const result = await productsCollection.insertOne(product);
      console.log(result);
      res.json(result);
    })

    // POST REVIEW API
    app.post('/reviews', async (req, res) => {
      const review = req.body;
      console.log('hit the post api', review);

      const result = await reviewsCollection.insertOne(review);
      console.log(result);
      res.json(result);
    })

    // GET REVIEW API
    app.get('/reviews', async (req, res) => {
      const cursor = reviewsCollection.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
    })

    // Add Orders API
    app.post('/orders', async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.json(result);
    })

    // MY ORDERS
    app.get("/myOrders/:email", async (req, res) => {
      const email = req.params.email;
      const result = await ordersCollection.find({ email }).toArray();
      res.send(result);
    });

    // GET Orders API
    app.get('/orders', async (req, res) => {
      const cursor = ordersCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    })

    // single orders DELETE API 
    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    })

    // Post users api
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });

    // upserting user 
    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    // checking admin
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    })

    // making admin
    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: 'admin' } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    })

    
  }
  finally {
    // await client.close();

  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Running Speed Server')
})

app.listen(port, () => {
  console.log(`Running Speed Server at http://localhost:${port}`)
})

// testing git push