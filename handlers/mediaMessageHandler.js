const handleMediaMessage = async (conn, msg, m) => {
  const sender = msg.key.remoteJid;

  if (msg.message.imageMessage) {
    console.log("Pesan berisi gambar");
    // Logika untuk menangani gambar

    await conn.sendMessage(
      sender,
      {
        text: `Pesan kamu berupa gambar!`,
      },
      { quoted: msg }
    );
  } else if (msg.message.videoMessage) {
    console.log("Pesan berisi video");
    // Logika untuk menangani video
  }
};

module.exports = { handleMediaMessage };
