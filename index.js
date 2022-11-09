const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.iz8azxp.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollection = client.db('dental').collection('services');
        const reviewCollection = client.db('dental').collection('reviews');


        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });
        app.post('/services', async (req, res) => {
            const service = req.body;
            // console.log(service);
            const services = await serviceCollection.insertOne(service);
            res.send(services);

        })



        app.get('/home', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services);
        });

        
        // single service find 

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });


        // for getting reviews data 

        app.get('/myreview', async (req, res) => {
            const query = {}
            const cursor = reviewCollection.find(query).sort({x:-1});
            const reviews = await cursor.toArray();
            res.send(reviews);
        });
        app.get('/myreview/:id', async (req, res) => {
            const id = req.params.id;
            const query = { id: id };
            const cursor = reviewCollection.find(query).sort({x:-1});
            const reviews = await cursor.toArray();
            res.send(reviews);
        });



        app.get('/review/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const reviews = await reviewCollection.findOne(query);
            // const reviews = await cursor.toArray();
            res.send(reviews);
        });
        app.put('/review/:id', async (req, res) => {
            const id = req.params.id;
            
            const filter = { _id: ObjectId(id) };
            const review = req.body;
            const option = {upsert: true}
            const updatedReview = {
                $set: {
                    reviewMessage: review.reviewMessage, 
                }
            }
            const result = await reviewCollection.updateOne(filter, updatedReview, option);
            res.send(result);
            console.log(review);
        })



        app.get('/myreview/user/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });


        // for posting reviews 
        app.post('/myreview', async (req, res) => {
            const review = req.body;
            // console.log(user);
            const reviews = await reviewCollection.insertOne(review);
            res.send(reviews);

        })

        app.delete('/myreview/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })
    }
    finally {

    }

}

run().catch(err => console.error(err));

app.get('/', (req, res) => {
    res.send('YourMedico server is running')
})

app.listen(port, () => {
    console.log(`yourMedico server running on ${port}`);
})