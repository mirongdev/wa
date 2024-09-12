const { MongoClient } = require('mongodb');
const { makeWASocket, AnyMessageContent,MessageType, MessageOptions, Mimetype } = require('@whiskeysockets/baileys');
const { useMongoDBAuthState} =require('mongo-baileys');
const Boom =require('@hapi/boom');

const url = "mongodb+srv://mirongdev:mirongdevx@clustermirongdev.331e4.mongodb.net/"; // Replace with your MongoDB connection string // When Obtaining Mongodb URL Choose NodeJS Driver Version 2 or Later but don't 3 or it higher
const dbName = "wa-bot";
const collectionName = "authState";


// const { default: makeWAconnet } = require('@adiwajshing/baileys-md');
const { messageEvent } = require('./events/messageEvent');
const setting = require('./config/settings');
const store = {}; // Tempat penyimpanan sementara data
const welcome = {}; // Data atau konfigurasi terkait pesan selamat datang



async function connectToMongoDB() {
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    return { client, collection };
}




async function startWhatsApp() {
    const { collection } = await connectToMongoDB();
    const { state, saveCreds } = await useMongoDBAuthState(collection);

    const conn = makeWASocket({
        auth: state,
        printQRInTerminal: true,
    });

    conn.ev.on('creds.update', saveCreds);

   // Menampilkan QR code di terminal untuk login
   conn.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    // Tampilkan QR Code
    if (qr) {
        qrcode.generate(qr, { small: true });
    }

    // Jika koneksi terputus, coba sambung kembali
    if (connection === 'close') {
        const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log('Koneksi terputus, mencoba sambung kembali...', shouldReconnect);
        if (shouldReconnect) {
            startconn();
        }
    } else if (connection === 'open') {
        console.log('Koneksi tersambung');
    }
});

// Memuat event messages.upsert
conn.ev.on('messages.upsert', messageEvent(conn, setting, store, welcome));

// Event menerima pesan
// Event menerima pesan
// conn.ev.on('messages.upsert', async (message) => {
//     // console.log('Pesan diterima:', JSON.stringify(message, null, 2));

//     // Pesan terbaru
//     const msg = message.messages[0];

//     // Jika pesan dari seseorang (bukan dari grup) dan pesan adalah teks
//     if (!msg.key.fromMe && msg.message && msg.message.conversation) {
//         const receivedMessage = msg.message.conversation;
//         const sender = msg.key.remoteJid;  // Mendapatkan pengirim pesan

//         console.log('Pesan teks:', receivedMessage);

//         // Buat quotedMessage untuk balasan 1
//         const messagesX= {
//             key: {
//                 fromMe: msg.key.fromMe,
//                 remoteJid: msg.key.remoteJid,
//                 id: msg.key.id,
//             },
//             message: msg.message
//         };

//         // Balasan 1 dengan kutipan
//         await conn.sendMessage(sender, { 
//             text: `apa mas`,
//         }, { quoted: messagesX });
//         console.log(`Balasan 1 dengan kutipan dikirim ke ${sender}`);

//         // Balasan 2 dengan kutipan
//         const quotedMessage2 = {
//             key: {
//                 fromMe: msg.key.fromMe,
//                 remoteJid: msg.key.remoteJid,
//                 id: msg.key.id,
//             },
//             message: msg.message
//         };

//         // Opsi tambahan untuk pengiriman pesan
//         const options = {
//             quoted: quotedMessage2,
//             contextInfo: {
//                 forwardingScore: 2,
//                 isForwarded: true
//             }
//         };

//         const sentMsg = await conn.sendMessage(sender, {
//             text: `Pesan kamu: "${receivedMessage}" telah diterima! Terima kasih sudah menghubungi.`,
//         }, options);

//         console.log(`Balasan 2 dengan kutipan dikirim ke ${sender}`);
//     }
// });





    // conn.ev.on('messages.upsert', async (m) => {
    //     console.log(JSON.stringify(m, null, 2));

    //     const message = m.messages[0];
    //     if (message && !message.key.fromMe && m.type === 'notify') {
    //         console.log('Replying to', message.key.remoteJid);
    //         await conn.sendMessage(message.key.remoteJid, { text: 'Hello there!' });
    //     }
    // });

    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('Received SIGINT. Closing connection...');
        await conn.close();
        process.exit();
    });

    process.on('SIGTERM', async () => {
        console.log('Received SIGTERM. Closing connection...');
        await conn.close();
        process.exit();
    });
}

startWhatsApp().catch(err => console.error("Unexpected error:", err));