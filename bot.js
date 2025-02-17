const puppeteer = require("puppeteer-core");
const venom = require("venom-bot");
const axios = require("axios");
require("dotenv").config();

// URL Apps Script Google Sheets (disimpan dalam environment variable)
const GOOGLE_SHEET_WEBHOOK = process.env.GOOGLE_SHEET_WEBHOOK;
if (!GOOGLE_SHEET_WEBHOOK) {
  console.error("❌ ERROR: GOOGLE_SHEET_WEBHOOK tidak ditemukan!");
  process.exit(1); // Keluar jika tidak ada webhook
}

// Deteksi apakah running di Koyeb
const isKoyeb = process.env.KOYEB === "true";

// Tentukan path ke executable Chromium
const executablePath = process.env.CHROME_BIN || "/usr/bin/chromium-browser"; // Pastikan path ini benar
console.log("🔄 Path ke Chromium:", executablePath); // Debugging path ke Chromium

(async () => {
  try {
    console.log("🔄 Menjalankan Puppeteer...");

    // Menjalankan browser Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      executablePath,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-software-rasterizer",
        "--remote-debugging-port=9222", // Bisa membantu debugging
      ],
    });

    console.log("✅ Puppeteer Siap:", browser.wsEndpoint());

    // Menjalankan Venom Bot
    venom
      .create({
        session: "whatsapp-session",
        headless: true,
        browserPath: executablePath,
        browserArgs: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--disable-software-rasterizer",
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-renderer-backgrounding",
          "--use-gl=swiftshader",
        ],
        useChrome: false,
        waitForLogin: true, // Tunggu login sebelum lanjut
      })
      .then((client) => start(client))
      .catch((error) => {
        console.error("❌ ERROR: Gagal memulai Venom bot", error);
        process.exit(1); // Keluar jika Venom gagal
      });
  } catch (error) {
    console.error("❌ ERROR Menjalankan Puppeteer:", error);
    process.exit(1); // Keluar jika Puppeteer gagal
  }
})();

async function sendToGoogleSheets(client, message) {
  try {
    if (!message.body.startsWith("#")) return; // Pastikan pesan diawali dengan #

    const keluhanText = message.body.substring(1).trim(); // Ambil keluhan setelah #
    if (!keluhanText) return; // Jika tidak ada keluhan, batalkan

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
      httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
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
    console.error("❌ ERROR saat mengirim ke Google Sheets:", error);
    await client.sendText(
      message.from,
      "❌ Terjadi kesalahan saat mencatat keluhan Anda. Silakan coba lagi nanti."
    );
  }
}

function start(client) {
  client.onMessage(async (message) => {
    console.log("📩 Pesan diterima:", message); // Debugging

    // Pastikan message.body ada dan bertipe string sebelum menggunakan startsWith
    if (!message || !message.body || typeof message.body !== "string") {
      console.warn("⚠️ Pesan tidak valid atau tidak memiliki body:", message);
      return;
    }

    // Jika pesan diawali dengan "#", bot akan membalas dan mencatat
    if (message.body.startsWith("#")) {
      await client.sendText(message.from, "✅ Keluhan Anda sedang diproses!");
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
