
// Event menerima pesan
sock.ev.on('messages.upsert', async (message) => {
    console.log('Pesan diterima:', JSON.stringify(message, null, 2));

    // Ambil pesan terbaru
    const msg = message.messages[0];

    // Debugging: Tampilkan struktur objek msg
    console.log('Struktur msg:', JSON.stringify(msg, null, 2));

    try {
        // Pastikan msg dan msg.message tidak null
        if (msg && msg.key && msg.message) {
            const receivedMessage = msg.message.conversation || (msg.message.extendedTextMessage && msg.message.extendedTextMessage.text);
            const sender = msg.key.remoteJid;  // Mendapatkan pengirim pesan

            if (receivedMessage) {
                console.log('Pesan teks:', receivedMessage);

                // Opsi untuk kutipan pesan
                const quotedMessage = {
                    key: {
                        fromMe: msg.key.fromMe,
                        remoteJid: msg.key.remoteJid,
                        id: msg.key.id,
                    },
                    message: msg.message
                };

                // Opsi tambahan untuk pengiriman pesan
                const options = {
                    quoted: quotedMessage,
                    contextInfo: {
                        forwardingScore: 2,
                        isForwarded: true
                    }
             
                };

                const sentMsg = await sock.sendMessage(sender, {
                    text: `Pesan kamu: "${receivedMessage}" telah diterima! Terima kasih sudah menghubungi.`,
                }, options);

                console.log(`Balasan dengan kutipan dikirim ke ${sender}`);
            } else {
                console.error('Pesan tidak memiliki teks untuk dikutip.');
            }
        } else {
            console.error('Pesan tidak valid untuk dikutip.');
        }
    } catch (error) {
        console.error('Error dalam pemrosesan pesan:', error);
    }
});



    // Event menerima pesan
    sock.ev.on('messages.upsert', async (message) => {
        console.log('Pesan diterima:', JSON.stringify(message, null, 2));

        // Pesan terbaru
        const msg = message.messages[0];

        // Jika pesan dari seseorang (bukan dari grup) dan pesan adalah teks
        if (!msg.key.fromMe && msg.message && msg.message.conversation) {
            const receivedMessage = msg.message.conversation;
            console.log('Pesan teks:', receivedMessage);

            // Balas pesan
            await sock.sendMessage(msg.key.remoteJid, { text: 'Halo, ini adalah bot WhatsApp menggunakan Baileys!' });
        }
    });