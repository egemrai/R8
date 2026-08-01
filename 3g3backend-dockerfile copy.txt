# --- BUILD STAGE ---
FROM node:20 AS builder
WORKDIR /app

# 1️⃣ package.json dosyalarını önce kopyala (cache avantajı için)
COPY package*.json ./
# Eğer yarn kullanıyorsan `yarn install --frozen-lockfile`
RUN npm ci

# 2️⃣ Tüm proje dosyalarını kopyala (src, @types, tsconfig, vs.)
COPY . .

# 3️⃣ TypeScript build işlemi
RUN npm run build


# --- PRODUCTION STAGE ---
FROM node:20-slim
WORKDIR /app

# 4️⃣ Sadece production bağımlılıklarını yükle / production dependencies (package.json'ı kopyala)
COPY package*.json ./
RUN npm ci --omit=dev

# 5️⃣ Build edilmiş JS dosyalarını kopyala
COPY --from=builder /app/dist ./dist

# 6️⃣ Ortam değişkeni ve port / session için .env dosyası prod ortamında kullanılmayacak: env var'lar panelde tanımlanmalı
ENV NODE_ENV=production
EXPOSE 5000

# 7️⃣ Uygulamayı başlat
CMD ["node", "dist/server.js"]