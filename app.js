const {
  DisconnectReason,
  useMultiFileAuthState,
  default: makeWASocket
} = require("@whiskeysockets/baileys");

const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const useMongoDBAuthState = require("./mongoAuthState"); // Pastikan Anda sudah punya file ini

// MongoDB Configuration
const mongoURL = "mongodb+srv://vercel-admin-user:vercel@clustermirongdev.331e4.mongodb.net/";
const waDBMongo = "wa-bot";
const waCollectionMongo = "auth_info_baileys";

// Express app and Socket.io
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Store real-time logs
const logMessages = [];

// Endpoint untuk melihat log secara real-time
app.get('/log', (req, res) => {
  res.sendFile(__dirname + '/log.html');  // Serve log.html, sebuah halaman frontend untuk menampilkan log secara real-time
});

// Endpoint untuk mengirim pesan
app.get('/send', async (req, res) => {
  const pesan = req.query.pesan;
  const tujuan = `${req.query.tujuan}@s.whatsapp.net`;

  if (!pesan || !tujuan) {
      res.status(400).send("Pesan atau tujuan tidak valid.");
      return;
  }

  try {
      await sendMessage(tujuan, pesan);
      res.send(`Pesan "${pesan}" berhasil dikirim ke ${req.query.tujuan}`);
  } catch (error) {
      res.status(500).send(`Gagal mengirim pesan: ${error.message}`);
  }
});

// Mulai server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Simpan referensi ke WhatsApp socket
let sock;

// Menghubungkan ke MongoDB dan WhatsApp
async function connectionLogic() {
  try {
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
      const collection = mongoClient.db(waDBMongo).collection(waCollectionMongo);
      const { state, saveCreds } = await useMongoDBAuthState(collection);

      sock = makeWASocket({
          printQRInTerminal: true,
          auth: state,
      });

      sock.ev.on("connection.update", async (update) => {
          const { connection, lastDisconnect } = update || {};

          if (connection === "close") {
              const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
              if (shouldReconnect) {
                  connectionLogic();  // Reconnect jika tidak logged out
              }
          } else if (connection === "open") {
              log('WhatsApp berhasil terhubung');
              await sendMessage("6285710002811@s.whatsapp.net", "Koneksi WhatsApp berhasil!");
          }
      });

      sock.ev.on("creds.update", saveCreds);

      // Menghandle pesan masuk
  // Menghandle pesan masuk
sock.ev.on("messages.upsert", async (messageInfo) => {
  const message = messageInfo.messages[0];
  
  if (message.key.remoteJid === 'status@broadcast') return; // Abaikan pesan status

  let pesanMasuk = "";

  // Mengecek tipe pesan yang masuk
  if (message.message?.conversation) {
      pesanMasuk = message.message.conversation;
  } else if (message.message?.extendedTextMessage?.text) {
      pesanMasuk = message.message.extendedTextMessage.text;
  } else if (message.message?.imageMessage?.caption) {
      pesanMasuk = message.message.imageMessage.caption;  // Jika pesan berupa gambar dengan keterangan
  } else {
      // Jika pesan bukan teks atau tidak dapat dikenali, kita abaikan untuk sementara
      console.log('Pesan tidak dikenali atau bukan pesan teks');
      return;
  }

  // Respon otomatis
  if (pesanMasuk === '/hallo') {
      await sendMessage(message.key.remoteJid, 'Hallo apa kabar?');
  }

  // Log pesan masuk
  log(`Pesan masuk dari ${message.key.remoteJid}: ${pesanMasuk}`);
});


  } catch (error) {
      log(`Error connecting to MongoDB or WhatsApp: ${error.message}`);
  }
}

// Fungsi untuk mengirim pesan
async function sendMessage(to, message) {
  if (!sock) throw new Error('WhatsApp socket belum siap');
  await sock.sendMessage(to, { text: message });
}

// Fungsi log untuk menampilkan dan menyimpan log real-time
function log(message) {
  logMessages.push(message);
  io.emit('log', message);  // Emit log ke semua client yang terhubung via Socket.io
  console.log(message);
}

// Koneksi ke WhatsApp
connectionLogic();

