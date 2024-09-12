const handleTextMessage = async (conn, msg, m, setting) => {
  const receivedMessage = msg.message.conversation;
  const sender = msg.key.remoteJid;
  console.log(`pesan dari ${sender}: ${receivedMessage}`);




  const chats = msg.message.conversation;

  const args = chats.split(" ");
  const command = chats.toLowerCase().split(" ")[0] || "";
  var prefix = /^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/.test(chats)
    ? chats.match(/^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/gi)
    : "#";
  const isCmd = command.startsWith(prefix);
  const isGroup = msg.key.remoteJid.endsWith("@g.us");
  const toJSON = (j) => JSON.stringify(j, null, "\t");

  const from = msg.key.remoteJid;
  const reply = (teks) => {
    conn.sendMessage(from, { text: teks }, { quoted: msg });
  };

  switch (command) {
    // Main Menu
    case prefix + "menu":
    case prefix + "help":
      reply(`tolong-tolong`);
      // var teks = allmenu(sender, prefix, pushname, isOwner, isPremium, balance, limit, limitCount, glimit, gcount)
      // conn.sendMessage(from, { caption: teks, location: {}, templateButtons: buttonsDefault, mentions: [sender] })
      break;
    case "fay":
      reply(
        `Hi 👋 apa kamu mengenalku?, jika belum, sangat senang sekali jika kamu mau perkenalkan diri dulu sebelum lanjut percakapan ini. :D 😬`
      );
      break;
    case "sayang":
      reply(`iya ayang akuuu 🤗.`);
      break;
    case prefix + "runtime":
      // reply(runtime(process.uptime()))
      break;
    case prefix + "speed":
      // let timestamp = speed();
      //                   let latensi = speed() - timestamp
      //                   textImg(`${latensi.toFixed(4)} Second`)
      break;
    case prefix + "donate":
    case prefix + "donasi":
      // reply(`──「 MENU DONATE 」──\n\nHi ${pushname} 👋🏻\n\`\`\`GOPAY : 085755567917\`\`\`\n\`\`\`PULSA : 085755567917 (Indosat)\`\`\`\nTerimakasih donasi kamu sangat membantu\n──「 THX FOR YOU ! 」──`)
      break;
    case prefix + "owner":

    // for (let x of ownerNumber) {
    //   sendContact(from, x.split('@s.whatsapp.net')[0], 'Owner', msg)
    // }

    // 	break
    default:
      if (!isGroup && isCmd) {
        reply(`-_- Tidak tau aku tuh apa yg kamu ketik`);
      }
  }

  

  // Balasan otomatis
  // await conn.sendMessage(
  //   sender,
  //   {
  //     text: `Pesan kamu: "${receivedMessage}" telah diterima!`,
  //   },
  //   { quoted: msg }
  // );

  // await conn.sendMessage(
  //   sender,
  //   {
  //     text: `ini balasan yang mengkutip pesan :"${receivedMessage}"`,
  //   },
  //   { quoted: msg }
  // );
};

module.exports = { handleTextMessage };
