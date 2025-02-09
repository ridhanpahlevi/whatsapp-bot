const venom = require("venom-bot");
const puppeteer = require("puppeteer");
const axios = require("axios");
require("dotenv").config();

const GOOGLE_SHEET_WEBHOOK =
  "https://script.google.com/macros/s/AKfycbzdpICl0zSzSi2fWiz5X5FC2oml3_TIveJCfBSmgkmyo9hIFkRSwKo2SDojghPleLCbXA/exec"; // Ganti dengan URL Apps Script

const isKoyeb = process.env.KOYEB === "true"; // Deteksi jika running di Koyeb

(async () => {
  try {
    console.log("🔄 Menjalankan Puppeteer...");

    const browser = await puppeteer.launch({
      headless: "false",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-software-rasterizer",
      ],
    });

    console.log("✅ Puppeteer Siap");
    const executablePath = puppeteer.executablePath(); // Ambil path Chromium Puppeteer

    venom
      .create({
        session: "whatsapp-session",
        headless: "new",
        browserPath: executablePath, // Pakai Chromium dari Puppeteer
        browserArgs: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--disable-software-rasterizer",
        ],
        useChrome: false, // Jangan pakai Chrome bawaan sistem
      })
      .then((client) => start(client))
      .catch((error) => console.error("❌ ERROR Venom:", error));
  } catch (error) {
    console.error("❌ ERROR Menjalankan Puppeteer:", error);
  }
})();

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

    const response = await axios.post(GOOGLE_SHEET_WEBHOOK, data, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("✅ Respon dari Google Sheets:", response.data);

    if (response.status !== 200) {
      throw new Error(`Google Sheets response error: ${response.status}`);
    }

    await client.sendText(
      message.from,
      `✅ *${senderName}*, laporan telah dicatat!\n📝 Nomor Keluhan: ${nomorKeluhan}`
    );

    console.log("✅ Balasan berhasil dikirim!");
  } catch (error) {
    console.error("❌ ERROR:", error);
  }
}

function start(client) {
  client.onMessage(async (message) => {
    if (message.body.startsWith("#")) {
      await sendToGoogleSheets(client, message);
    }
  });

  console.log("✅ Bot is running!");
}

if (isKoyeb) {
  console.log("🚀 Running on Koyeb Cloud...");
} else {
  console.log("👨‍💻 Running locally...");
}
