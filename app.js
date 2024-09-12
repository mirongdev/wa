const {
  DisconnectReason,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const useMongoDBAuthState = require("./mongoAuthState");
const makeWASocket = require("@whiskeysockets/baileys").default;
// const mongoURL =
//   "mongodb+srv://mirongdev:mirongdevx@clustermirongdev.331e4.mongodb.net/";

  const mongoURL =
  "mongodb+srv://vercel-admin-user:vercel@clustermirongdev.331e4.mongodb.net/";

// const { MongoClient } = require("mongodb");
const { MongoClient, ServerApiVersion } = require('mongodb');

const { messageEvent } = require("./events/messageEvent");
const setting = require("./config/settings");
const store = {}; // Tempat penyimpanan sementara data
const welcome = {}; // Data atau konfigurasi terkait pesan selamat datang
const waDBMongo = "wa-bot";
const waCollectionMongo ="auth_info_baileys";



const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('wa engine by mirongdev vercel');
});
app.get('/cek', (req, res) => {
    res.send('perubahan menunggu proses build selesai yah');
  });


  app.get('/run', (req, res) => {
    res.send('menjalankan wa engine');
    connectionLogic();
  });
 
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});



const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://vercel-admin-user:vercel@clustermirongdev.331e4.mongodb.net/wa-bot');

const Cat = mongoose.model('CatVercel', { name: String });

const kitty = new Cat({ name: 'Zildjian' });
kitty.save().then(() => console.log('meow'));


async function connectionLogic() {

//   const mongoClientx = new MongoClient(mongoURL, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });


  const mongoClient = new MongoClient(mongoURL, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
      ssl: true,
      serverSelectionTimeoutMS: 50000
    }
  });


  await mongoClient.connect();
  // const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
  const collection = mongoClient.db(waDBMongo).collection(waCollectionMongo);
  const { state, saveCreds } = await useMongoDBAuthState(collection);
  const sock = makeWASocket({
    // can provide additional config here
    printQRInTerminal: true,
    auth: state,
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update || {};

    if (qr) {
      console.log(qr);
      // write custom logic over here
    }

    if (connection === "close") {
        console.log('koneksi terpputus');
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      if (shouldReconnect) {
        connectionLogic();
      }
    }

    else if (connection === 'open') {
        console.log('Berhasil terhubung');
    }


  });

  sock.ev.on("messages.update", (messageInfo) => {
    // console.log(messageInfo);
  });

  // sock.ev.on("messages.upsert", (messageInfoUpsert) => {
  //   console.log(messageInfoUpsert);
  // });

  // Memuat event messages.upsert
  sock.ev.on("messages.upsert", messageEvent(sock, setting, store, welcome));

  sock.ev.on("creds.update", saveCreds);// pastikan kredensial terus diperbarui dan disimpan
  
}


connectionLogic();