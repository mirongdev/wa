const serialize = (conn, msg) => {
    // Tambahkan properti atau fungsi baru ke dalam objek pesan (msg)
    msg.reply = (text) => conn.sendMessage(msg.key.remoteJid, { text: text }, { quoted: msg });
    return msg;
};

module.exports = { serialize };
