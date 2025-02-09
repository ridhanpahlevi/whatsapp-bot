FROM ghcr.io/puppeteer/puppeteer:latest
WORKDIR /workspace
COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "start"]
