# Gunakan Node.js versi terbaru
FROM node:18

# Set work directory
WORKDIR /app

# Copy semua file ke container
COPY . .

# Install dependencies
RUN npm install

# Install Puppeteer dependencies
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk1.0-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libdbus-glib-1-2 \
    libasound2 \
    libgbm-dev \
    && rm -rf /var/lib/apt/lists/*

# Jalankan Bot
CMD ["node", "bot.js"]
