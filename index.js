const express = require('express'); // Corrected from 'expres' to 'express'
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
require('dotenv').config();



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4b5mrxj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri)
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
    // Connect the client to the server	(o ptional starting in v4.7)
    // await client.connect();
     
    const shopCollection = client.db('shopProduct').collection('product');

   
    app.get("/products", async (req, res) => {
        const search = req.query.search || "";
        const order = req.query.order || "";
        const brandFilter = req.query.brandFilter || "";
        const categoryFilter = req.query.categoryFilter || "";
        const priceRange = req.query.priceRange || "";
        const page = parseInt(req.query.page) || 1; 
        const limit = 6; 
    
        const skip = (page - 1) * limit;
    
        let query = {
            name: { $regex: search, $options: 'i' }
        };
    
        if (brandFilter) query.brand = brandFilter;
        if (categoryFilter) query.category = categoryFilter;
    
        if (priceRange === "low") {
            query.price = { $lt: 50 };
        } else if (priceRange === "medium") {
            query.price = { $gte: 50, $lte: 100 };
        } else if (priceRange === "high") {
            query.price = { $gt: 100 };
        }
    
        const totalProducts = await shopCollection.countDocuments(query);
    
        let products = await shopCollection
            .find(query)
            .skip(skip)
            .limit(limit);
    
        if (order === "priceLowToHigh") {
            products = products.sort({ price: 1 });
        } else if (order === "priceHighToLow") {
            products = products.sort({ price: -1 });
        } else if (order === "dateNewestFirst") {
            products = products.sort({ createdAt: -1 });
        }
    
        products = await products.toArray();
    
        res.send({
            products,
            totalProducts,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: page
        });
    });
    
    
    



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('server  is running');
});

app.listen(port, () => {
    console.log('Server is running on port', port);
});
