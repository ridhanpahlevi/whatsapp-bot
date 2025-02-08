const venom = require("venom-bot");
const axios = require("axios");
require("dotenv").config();

const GOOGLE_SHEET_WEBHOOK =
  "https://script.google.com/macros/s/AKfycbzdpICl0zSzSi2fWiz5X5FC2oml3_TIveJCfBSmgkmyo9hIFkRSwKo2SDojghPleLCbXA/exec"; // Ganti dengan URL Apps Script

// Buat sesi WhatsApp bot
venom
  .create({
    session: "whatsapp-session",
    headless: true,
    browserArgs: ["--no-sandbox", "--disable-setuid-sandbox"],
  })
  .then((client) => start(client))
  .catch((error) => console.log("❌ ERROR:", error));

async function sendToGoogleSheets(client, message) {
  try {
    if (!message.body.startsWith("#")) return;

    const keluhanText = message.body.substring(1).trim();
    if (!keluhanText) return;

    const now = new Date();
    const nomorKeluhan = `${now.getDate()}${
      now.getMonth() + 1
    }${now.getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;

    console.log("📌 Nomor Keluhan:", nomorKeluhan);

    const senderId =
      message.sender?.id?.user || message.from.replace("@c.us", "");
    const senderName = message.sender?.pushname || senderId;

    const data = {
      nomor_keluhan: nomorKeluhan,
      tanggal: now.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
      pengaju: senderName,
      keluhan: keluhanText,
      status: "On Progress",
    };

    console.log("📤 Data ke Google Sheets:", JSON.stringify(data));

    // Kirim data ke Google Sheets
    const response = await axios.post(GOOGLE_SHEET_WEBHOOK, data, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("✅ Respon dari Google Sheets:", response.data);

    if (response.status !== 200) {
      throw new Error(`Google Sheets response error: ${response.status}`);
    }

    console.log("📌 Mengirim balasan ke:", message.from);
    console.log("📌 Mention ID:", `${senderId}@c.us`);

    await client.sendText(
      message.from,
      `✅ *${senderName}*, laporan telah dicatat!\n📝 Nomor Keluhan: ${nomorKeluhan}`
    );

    console.log("✅ Balasan berhasil dikirim!");
  } catch (error) {
    console.error("❌ ERROR:", error);
  }
}

// Mulai bot WhatsApp
function start(client) {
  client.onMessage(async (message) => {
    if (message.body.startsWith("#")) {
      await sendToGoogleSheets(client, message);
    }
  });
}
