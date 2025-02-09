FROM node:18-slim

# Install dependencies untuk Chromium
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set environment variable untuk path Chromium
ENV CHROME_BIN=/usr/bin/chromium

# Install node modules
WORKDIR /workspace
COPY package*.json ./
RUN npm install

# Salin semua file ke dalam container
COPY . .

# Set entry point untuk aplikasi
CMD ["npm", "start"]
