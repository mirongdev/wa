const {
  DisconnectReason,
  useMultiFileAuthState,
  default: makeWASocket,
} = require("@whiskeysockets/baileys");

const MongoClient = require("mongodb").MongoClient;
const ServerApiVersion = require("mongodb").ServerApiVersion;
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const useMongoDBAuthState = require("./mongoAuthState");

const app = express();
const port = process.env.PORT || 3000;
const mongoURL = "mongodb+srv://vercel-admin-user:vercel@clustermirongdev.331e4.mongodb.net/";
const waDBMongo = "wa-bot";

// const isLocal = process.env.NODE_ENV !== 'production';
const debug = false;
const waCollectionMongo = debug ? "auth_info_baileys_debug" : "auth_info_baileys";

const logMessages = [];

// Express and Socket.io setup
const server = http.createServer(app);
const io = socketIO(server);
const P = require('pino')

const logger = P({ timestamp: () => `,"time":"${new Date().toJSON()}"` }, P.destination('./wa-logs.txt'));
logger.level = 'debug'; // Set logging level to debug


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

app.get('/log', (req, res) => {
  res.sendFile(__dirname + '/log.html'); // Serve log.html
});

app.get('/send', async (req, res) => {
  const pesan = req.query.pesan;
  const tujuan = `${req.query.tujuan}@s.whatsapp.net`;

  if (!pesan || !tujuan) {
    res.status(400).send("Pesan atau tujuan tidak valid.");
    log(`Pesan atau tujuan tidak valid.`);
    return;
  }

  try {
    await sendMessage(tujuan, pesan);
    res.send(`Pesan "${pesan}" berhasil dikirim ke ${req.query.tujuan}`);
    log(`Pesan "${pesan}" berhasil dikirim ke ${req.query.tujuan}`);
  } catch (error) {
    res.status(500).send(`Gagal mengirim pesan: ${error.message}`);
    log(`Gagal mengirim pesan: ${error.message}`);
  }
});

server.listen(port, () => {
  // console.log(`Server running on port ${port}`);
  log(`Server running on port ${port}`);
});

let sock; // Define sock globally

async function connectionLogic() {
  try {
    const mongoClient = new MongoClient(mongoURL, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
        ssl: true,
        serverSelectionTimeoutMS: 50000,
      },
    });

    await mongoClient.connect();
    const collection = mongoClient.db(waDBMongo).collection(waCollectionMongo);
    const { state, saveCreds } = await useMongoDBAuthState(collection);

    sock = makeWASocket({
      printQRInTerminal: true,
      auth: state,
    });

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update || {};

      if (qr) {
        console.log(qr);
        log(qr);
        // write custom logic over here
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;

        if (statusCode !== DisconnectReason.loggedOut) {
          connectionLogic(); // Reconnect if not logged out
        } else {
          console.log('Connection closed. You are logged out.');
          log('Connection closed. You are logged out.');
        }
      }

      if (connection === "open") {
        console.log("Berhasil terhubung");
        log("Berhasil terhubung"); // Log to Socket.io
      }
    });

    sock.ev.on("messages.upsert", (messageInfo) => {
      // Implement message event logic here
    });

    sock.ev.on("creds.update", saveCreds); // Save credentials on update

  } catch (error) {
    log(`Error connecting to MongoDB or WhatsApp: ${error.message}`);
  }
}

async function sendMessage(to, message) {
  if (!sock) throw new Error('WhatsApp socket belum siap');
  await sock.sendMessage(to, { text: message });
}

function log(message) {
  logMessages.push(message);
  io.emit('log', message); // Emit log to all connected clients via Socket.io
  console.log(message); // Also display in console
}

connectionLogic();
