const { handleTextMessage } = require("./textMessageHandler");
const { handleMediaMessage } = require("./mediaMessageHandler");

const handleMessage = (conn, msg, m, setting, store, welcome) => {

  // const chats = (type === 'conversation' && msg.message.conversation) ? msg.message.conversation : (type == 'imageMessage') && msg.message.imageMessage.caption ? msg.message.imageMessage.caption : (type == 'documentMessage') && msg.message.documentMessage.caption ? msg.message.documentMessage.caption : (type == 'videoMessage') && msg.message.videoMessage.caption ? msg.message.videoMessage.caption : (type == 'extendedTextMessage') && msg.message.extendedTextMessage.text ? msg.message.extendedTextMessage.text : (type == 'buttonsResponseMessage' && msg.message.buttonsResponseMessage.selectedButtonId) ? msg.message.buttonsResponseMessage.selectedButtonId : (type == 'templateButtonReplyMessage') && msg.message.templateButtonReplyMessage.selectedId ? msg.message.templateButtonReplyMessage.selectedId : ''

//   console.log("Pesan diterima:", JSON.stringify(msg, null, 2));
//   console.log("bentuk pesan" + msg);
const isGroup = msg.key.remoteJid.endsWith("@g.us");


if (msg && !msg.key.fromMe && m.type === 'notify'){

if(!isGroup){

  if (!msg.key.fromMe && msg.message && msg.message.conversation) {

    // Jika pesan adalah teks
    handleTextMessage(conn, msg, m, setting);
    console.log("berupa pesan text");
  } else if (!msg.key.fromMe &&
    msg.message.imageMessage ||
    msg.message.videoMessage ||
    msg.message.documentMessage
  ) {
    console.log("berupa pesan Media");
    handleMediaMessage(conn, msg, m);
  } 


}else{
  console.log("anda mencoba mengirim digoup yah?");
}
 


}else{
  // console.log("pesan tidak diketahui");
}



};

module.exports = { handleMessage };
