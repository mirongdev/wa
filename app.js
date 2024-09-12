const {
  DisconnectReason,
  useMultiFileAuthState,
  default: makeWASocket
} = require("@whiskeysockets/baileys");

const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const useMongoDBAuthState = require("./mongoAuthState");

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
  res.sendFile(__dirname + '/log.html'); // Serve log.html
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
  log(`Server running on port ${port}`);
});

// Simpan referensi ke WhatsApp socket
let sock;

// Fungsi koneksi ke MongoDB dan WhatsApp
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

    // Membuat koneksi WhatsApp
    sock = makeWASocket({
      printQRInTerminal: true,
      auth: state,
      // Hapus logger untuk menghindari masalah
    });

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update || {};
      if (connection === "close") {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        if (shouldReconnect) {
          log('Koneksi terputus, mencoba untuk menghubungkan ulang...');
          connectionLogic(); // Reconnect jika tidak logged out
        } else {
          log('Koneksi WhatsApp terputus karena logout.');
        }
      } else if (connection === "open") {
        log('WhatsApp berhasil terhubung');
        // Kirim pesan konfirmasi saat koneksi berhasil
        await sendMessage('085710002811@s.whatsapp.net', 'WhatsApp bot berhasil terhubung');
      }
    });

    sock.ev.on("creds.update", saveCreds);

    // Menghandle pesan masuk
    sock.ev.on("messages.upsert", async (messageInfo) => {
      const message = messageInfo.messages[0];
      const sender = message.key.remoteJid;

      if (sender === 'status@broadcast' || message.key.fromMe) return; // Abaikan pesan dari diri sendiri atau status broadcast
      if (sender.includes('@g.us')) return; // Abaikan pesan dari grup

      let pesanMasuk = "";

      // Mengecek tipe pesan yang masuk
      if (message.message?.conversation) {
        pesanMasuk = message.message.conversation;
      } else if (message.message?.extendedTextMessage?.text) {
        pesanMasuk = message.message.extendedTextMessage.text;
      } else if (message.message?.imageMessage?.caption) {
        pesanMasuk = message.message.imageMessage.caption;
      } else {
        log('Pesan tidak dikenali atau bukan pesan teks');
        return;
      }

      // Respon otomatis
      if (pesanMasuk === '/hallo') {
        await sendMessage(sender, 'Hallo apa kabar?');
      }

      // Log pesan masuk
      log(`Pesan masuk dari ${sender}: ${pesanMasuk}`);
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
  io.emit('log', message); // Emit log ke semua client yang terhubung via Socket.io
  console.log(message);    // Tampilkan juga di console
}

// Koneksi ke WhatsApp
connectionLogic();
