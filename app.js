const {
  DisconnectReason,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const useMongoDBAuthState = require("./mongoAuthState");
const makeWASocket = require("@whiskeysockets/baileys").default;
const { MongoClient, ServerApiVersion } = require("mongodb");

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const mongoURL = "mongodb+srv://vercel-admin-user:vercel@clustermirongdev.331e4.mongodb.net/";
const waDBMongo = "wa-bot";
const waCollectionMongo = "auth_info_baileys";

const setting = require("./config/settings");
const store = {}; // Tempat penyimpanan sementara data
const welcome = {}; // Data atau konfigurasi terkait pesan selamat datang

app.get("/", (req, res) => {
  res.send("wa engine by mirongdev vercel");
});

app.get("/cek", (req, res) => {
  res.send("perubahan menunggu proses build selesai yah");
});

app.get("/run", (req, res) => {
  res.send("menjalankan wa engine");
  connectionLogic();
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

async function connectionLogic() {
  try {
    const mongoClient = new MongoClient(mongoURL, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
        ssl: true,
        serverSelectionTimeoutMS: 50000, // Timeout yang cukup lama
      },
    });

    await mongoClient.connect();
    console.log("Connected to MongoDB");

    const collection = mongoClient.db(waDBMongo).collection(waCollectionMongo);

    // Mendapatkan state autentikasi dari MongoDB
    const { state, saveCreds } = await useMongoDBAuthState(collection);
    
    // Membuat koneksi WA Socket
    const sock = makeWASocket({
      printQRInTerminal: true,
      auth: state,
    });

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update || {};

      if (qr) {
        console.log("QR code generated:", qr);
      }

      if (connection === "close") {
        console.log("Connection closed. Reason:", lastDisconnect?.error?.output?.statusCode);
        
        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        
        if (shouldReconnect) {
          console.log("Reconnecting...");
          connectionLogic();
        } else {
          console.log("Logged out, not reconnecting.");
        }
      } else if (connection === "open") {
        console.log("Successfully connected to WhatsApp");
      }
    });

    // Menangani update pesan
    sock.ev.on("messages.upsert", messageEvent(sock, setting, store, welcome));

    // Menyimpan kredensial
    sock.ev.on("creds.update", saveCreds);

  } catch (error) {
    console.error("Error connecting to MongoDB or WhatsApp:", error.message);
  }
}

connectionLogic();
