const express = require("express");
const cors = require("cors");
const colors = require("colors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// midleweres
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.w9y9xep.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    app.post("/jwt", async (req, res) => {
      const user = await req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send({token});
    });

    const serviceCollection = client
      .db("car-Doctor-server")
      .collection("servicesCollection");
    const serviceOrderCollection = client
      .db("OrderData")
      .collection("servicesOrderCollection");

    //   get all services data from Mongodb Database
    app.get("/services", async (req, res) => {
      const qurey = {};
      const cursor = serviceCollection.find(qurey);
      const services = await cursor.toArray();
      res.send(services);
    });

    //   get specific services data from Mongodb databas
    app.get("/specificservices/:id", async (req, res) => {
      const id = req.params.id;
      const qurey = { _id: new ObjectId(id) };
      const specificData = await serviceCollection.findOne(qurey);
      res.send(specificData);
    });

    // Put Order data from client page to Mongodb Database
    app.post("/insert/order", async (req, res) => {
      const OrderData = req.body;
      const result = await serviceOrderCollection.insertOne(OrderData);
      res.send(result);
    });

    // get Specific Data client site to Mongodb database
    app.get("/orders", async (req, res) => {
      let qurey = {};
      console.log(req.headers.authorization)
      if (req.query) {
        qurey = {
          userEmail: req.query.email,
        };
      }
      const cursor = serviceOrderCollection.find(qurey);
      const orders = await cursor.toArray();
      res.send(orders);
    });

    // delete / Cencel specific order
    app.delete("/delete/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await serviceOrderCollection.deleteOne(query);
      res.send(result);
    });

    // update specific data
    app.patch("/update/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const status = req.body.status;
      const updateDoc = {
        $set: {
          status: status,
        },
      };
      const result = await serviceOrderCollection.updateOne(query, updateDoc);
      res.send(result);
      console.log(result);
    });
  } catch (error) {
    console.log(error.name.red.bold, error.message.red);
  } finally {
  }
};

run();

app.get("/", (req, res) => {
  res.send("Car Doctor server is running");
});

app.listen(port, () => {
  console.log("Car dorcor server is running".bgCyan);
});
