const handleMediaMessage = async (conn, msg, m) => {
  const sender = msg.key.remoteJid;

  if (msg.message.imageMessage) {
    console.log("Pesan kamu berupa imageMessage!");
    // Logika untuk menangani gambar

    await conn.sendMessage(
      sender,
      {
        text: `Pesan kamu berupa gambar!`,
      },
      { quoted: msg }
    );
  } else if (msg.message.videoMessage) {
    console.log("Pesan berisi videoMessage");
    await conn.sendMessage(
      sender,
      {
        text: `Pesan kamu berupa videoMessage!`,
      },
      { quoted: msg }
    );
  }else if (msg.message.documentMessage) {
    console.log("Pesan documentMessage");
    await conn.sendMessage(
      sender,
      {
        text: `Pesan kamu berupa documentMessage!`,
      },
      { quoted: msg }
    );

  }
};

module.exports = { handleMediaMessage };
