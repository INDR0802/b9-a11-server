const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nzfkcui.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const queryCollection = client.db("AlterPro").collection("queries");
    const recommendationCollection = client
      .db("AlterPro")
      .collection("recommendations");

    app.post("/queries", async (req, res) => {
      const newQuery = req.body;
      const result = await queryCollection.insertOne(newQuery);
      res.send(result);
    });

    app.post("/recommendation", async (req, res) => {
      const newRecommendation = req.body;
      const result = await recommendationCollection.insertOne(
        newRecommendation
      );
      res.send(result);
    });

    app.delete("/deletequery/:id", async (req, res) => {
      const id = req.params.id;
      const result = await queryCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });
    app.delete("/deleterecommendation/:id", async (req, res) => {
      const id = req.params.id;
      const result = await recommendationCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    app.get("/allqueries", async (req, res) => {
      const result = await queryCollection.find({}).sort({ _id: -1 }).toArray();
      res.send(result);
    });

    app.get("/myqueries/:id", async (req, res) => {
      const id = req.params.id;
      const result = await queryCollection
        .find({ email: id })
        .sort({ _id: -1 })
        .toArray();
      res.send(result);
    });

    app.get("/query/:id", async (req, res) => {
      const id = req.params.id;
      const result = await queryCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });
    app.get("/myrecommendations/:id", async (req, res) => {
      const id = req.params.id;
      const result = await recommendationCollection
        .find({ RecommenderEmail: id })
        .sort({ _id: -1 })
        .toArray();
      res.send(result);
    });
    app.get("/recommendationsforme/:id", async (req, res) => {
      const id = req.params.id;
      const result = await recommendationCollection
        .find({ userEmail: id })
        .sort({ _id: -1 })
        .toArray();
      res.send(result);
    });

    app.get("/recommendedproducts/:id", async (req, res) => {
      const id = req.params.id;
      const result = await recommendationCollection
        .find({ queryId: id })
        .toArray();
      res.send(result);
    });

    app.put("/updatequery/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedQuery = {
        $set: {
          name: req.body.name,
          brand: req.body.brand,
          image: req.body.image,
          title: req.body.title,
          reason: req.body.reason,
          displayName: req.body.displayName,
          email: req.body.email,
          photoURL: req.body.photoURL,
          date: req.body.date,
        },
      };
      const result = await queryCollection.updateOne(
        filter,
        updatedQuery,
        options
      );
      res.send(result);
    });

    app.put("/increase/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedQuery = {
        $inc: { recommendationCount: 1 },
      };
      const result = await queryCollection.updateOne(
        filter,
        updatedQuery,
        options
      );
      res.send(result);
    });
    app.put("/decrease/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedQuery = {
        $inc: { recommendationCount: -1 },
      };
      const result = await queryCollection.updateOne(
        filter,
        updatedQuery,
        options
      );
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
