const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
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

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.send({message: 'unauthorized access'});
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            res.send({message: 'unauthorized access'})
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        const serviceCollection = client.db('dental').collection('services');
        const reviewCollection = client.db('dental').collection('reviews');

        // post of jwt token start

        app.post('/jwt', (req, res) => {
            const user = req.body;
            // console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
            res.send({token});
        })


        // get services data that were added or already been there

        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });


        //post services data

        app.post('/services', async (req, res) => {
            const service = req.body;
            const services = await serviceCollection.insertOne(service);
            res.send(services);

        })


        // limited home tab services to 3 
        app.get('/home', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services);
        });


        // single service find by id

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });


        // for getting all reviews data 

        app.get('/myreview', async (req, res) => {
            const query = {}
            const cursor = reviewCollection.find(query).sort({ time: -1 });
            const reviews = await cursor.toArray();
            res.send(reviews);
        });


        // get data by id from all reviews data 
        app.get('/myreview/:id', async (req, res) => {
            const id = req.params.id;
            const query = { id: id };
            const cursor = reviewCollection.find(query).sort({ time: -1 });
            const reviews = await cursor.toArray();
            res.send(reviews);
        });


        // get single review data from id 

        app.get('/review/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const reviews = await reviewCollection.findOne(query);
            res.send(reviews);
        });


        // update single review by id 

        app.put('/review/:id', async (req, res) => {
            const id = req.params.id;

            const filter = { _id: ObjectId(id) };
            const review = req.body;
            const option = { upsert: true }
            const updatedReview = {
                $set: {
                    reviewMessage: review.reviewMessage,
                }
            }
            const result = await reviewCollection.updateOne(filter, updatedReview, option);
            res.send(result);
        })


        // search review via email query from all reviews 

        app.get('/myreview/user/:email', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            const email = req.params.email;
            const query = { email: email };
            if(decoded.email !== email){
                res.send({message: 'unauthorized access'})
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });


        // for posting where all reviews will be saved

        app.post('/myreview', async (req, res) => {
            const review = req.body;
            // console.log(user);
            const reviews = await reviewCollection.insertOne(review);
            res.send(reviews);

        })

        
        // delete one review form all reviews 

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