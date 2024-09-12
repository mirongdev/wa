const { handleTextMessage } = require("./textMessageHandler");
const { handleMediaMessage } = require("./mediaMessageHandler");

const handleMessage = (conn, msg, m, setting, store, welcome) => {
  // const chats = (type === 'conversation' && msg.message.conversation) ? msg.message.conversation : (type == 'imageMessage') && msg.message.imageMessage.caption ? msg.message.imageMessage.caption : (type == 'documentMessage') && msg.message.documentMessage.caption ? msg.message.documentMessage.caption : (type == 'videoMessage') && msg.message.videoMessage.caption ? msg.message.videoMessage.caption : (type == 'extendedTextMessage') && msg.message.extendedTextMessage.text ? msg.message.extendedTextMessage.text : (type == 'buttonsResponseMessage' && msg.message.buttonsResponseMessage.selectedButtonId) ? msg.message.buttonsResponseMessage.selectedButtonId : (type == 'templateButtonReplyMessage') && msg.message.templateButtonReplyMessage.selectedId ? msg.message.templateButtonReplyMessage.selectedId : ''

  //   console.log("Pesan diterima:", JSON.stringify(msg, null, 2));
  //   console.log("bentuk pesan" + msg);
  // const isGroup = msg.key.remoteJid.endsWith("@g.us");

  // if (sender === 'status@broadcast' || message.key.fromMe) return; // Abaikan pesan dari diri sendiri atau status broadcast
  const isGroup = msg.key.remoteJid.includes("@g.us");
  const toJSON = (j) => JSON.stringify(j, null, "\t");
  if (
    msg &&
    !msg.key.fromMe &&
    m.type === "notify" &&
    msg.key.remoteJidr != "status@broadcast"
  ) {
    console.log(`apakah group? : ${isGroup}`);
    console.log(`type : ${m.type}`);
    if (!isGroup) {
      if (!msg.key.fromMe && msg.message && msg.message.conversation) {
        // Jika pesan adalah teks
        handleTextMessage(conn, msg, m, setting);
        console.log("berupa pesan text");
      }

      // if (
      //   msg.message.imageMessage
      
      // ) {
      //   console.log("berupa pesan gambar");
      //   // console.log( msg.message)
      // }

      // if (msg.message.videoMessage) {
      //   console.log("berupa pesan video");
      // }

      // if (msg.message.documentMessage) {
      //   console.log("berupa pesan dokumen");
      //   console.log( msg.message)
      // }

       if (
        msg.message.imageMessage ||
        msg.message.videoMessage ||
        msg.message.documentMessage
      )

      {
        console.log("[Pesan Media]");
        handleMediaMessage(conn, msg, m);
      }
    } else {
      // console.log("anda mencoba mengirim digoup yah?");
    }
  } else {
    // console.log("pesan tidak diketahui");
  }
};

module.exports = { handleMessage };
