const { serialize } = require('../utils/serialize');
const { handleMessage } = require('../handlers/messageHandler');

const messageEvent = (conn, setting, store, welcome) => async (message) => {
    if (!message.messages) return;
    
    // Ambil pesan terbaru dan serialisasikan
    let msg = message.messages[0];
    msg = serialize(conn, msg);
    
    // Cek apakah pesan berasal dari Baileys atau bukan
    // msg.isBaileys = msg.key.id.startsWith('BAE5') || msg.key.id.startsWith('3EB0');
    

    //    const messagesX= {
    //         key: {
    //             fromMe: msg.key.fromMe,
    //             remoteJid: msg.key.remoteJid,
    //             id: msg.key.id,
    //         },
    //         message: msg.message
    //     };
    // Panggil handler utama untuk memproses pesan
    handleMessage(conn, msg, message, setting, store, welcome);
};

module.exports = { messageEvent };
