# Gunakan image yang kompatibel dengan Puppeteer
FROM node:20

# Install dependencies untuk Puppeteer & Chrome
RUN apt-get update && apt-get install -y wget curl unzip \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libxkbcommon-x11-0 libxcomposite1 \
    libxrandr2 libgbm-dev libpangocairo-1.0-0 \
    libasound2 libpango-1.0-0 libgtk-3-0 

# Set working directory
WORKDIR /app

# Copy project files
COPY package.json package-lock.json ./
RUN npm install

# Copy seluruh project
COPY . .

# Jalankan bot
CMD ["node", "bot.js"]
