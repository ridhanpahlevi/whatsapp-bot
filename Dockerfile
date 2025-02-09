# Menggunakan image dasar node versi 18 slim
FROM node:18-slim

# Set direktori kerja di dalam container
WORKDIR /workspace

# Menyalin file package.json dan package-lock.json
COPY package*.json ./

# Menjalankan npm install dengan izin root untuk mengatasi masalah akses
USER root
RUN npm install

# Menyalin semua file lain ke dalam container
COPY . .

# Menentukan perintah default untuk menjalankan aplikasi
CMD ["npm", "start"]
