FROM node:16-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
  wget \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libx11-xcb1 \
  libxtst6 \
  lsb-release \
  xdg-utils \
  chromium

# Install venom-bot
WORKDIR /app
COPY . /app
RUN npm install

# Set environment variable for chromium
ENV CHROME_BIN=/usr/bin/chromium

# Expose port
EXPOSE 8080

# Run the bot
CMD ["node", "bot.js"]
