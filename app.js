const express = require("express");
const http = require("http");
const MongoClient = require("mongodb").MongoClient;
const socketIO = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const port = process.env.PORT || 3000;
const mongoURL = process.env.MONGO_URL || "mongodb+srv://vercel-admin-user:vercel@clustermirongdev.331e4.mongodb.net/";
const waDBMongo = "wa-bot";

let logMessages = [];

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
let db;
MongoClient.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
  if (err) throw err;
  db = client.db(waDBMongo);
  console.log("Connected to MongoDB");
});

// Utility function to log messages
function log(message) {
  logMessages.push(message);
  io.emit('log', message);
  console.log(message);
}

// Routes
app.get("/", (req, res) => {
  res.send("wa engine by mirongdev vercel");
});

app.get('/log', (req, res) => {
  res.sendFile(__dirname + '/log.html');
});

// Insert contact
app.get('/insert', async (req, res) => {
  try {
    const { nama, alamat, nomer } = req.query;
    if (!nama || !alamat || !nomer) {
      return res.status(400).send("Missing query parameters");
    }
    const result = await db.collection('contacts').insertOne({ nama, alamat, nomer });
    log(`Inserted contact: ${JSON.stringify(result.ops[0])}`);
    res.send("Contact inserted");
  } catch (error) {
    log(`Error inserting contact: ${error}`);
    res.status(500).send("Internal Server Error");
  }
});

// View contacts
app.get('/view', async (req, res) => {
  try {
    const contacts = await db.collection('contacts').find().toArray();
    res.json(contacts);
  } catch (error) {
    log(`Error viewing contacts: ${error}`);
    res.status(500).send("Internal Server Error");
  }
});

// Delete contact
app.get('/delete', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).send("Missing query parameter id");
    }
    const result = await db.collection('contacts').deleteOne({ _id: new require('mongodb').ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).send("Contact not found");
    }
    log(`Deleted contact with id: ${id}`);
    res.send("Contact deleted");
  } catch (error) {
    log(`Error deleting contact: ${error}`);
    res.status(500).send("Internal Server Error");
  }
});

// Start server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
