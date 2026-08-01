# build stage
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
RUN npm run build

# production stage
FROM nginx:alpine
# build dosyalarını nginx'e kopyala
COPY --from=build /app/build /usr/share/nginx/html
# nginx anasayfa dışı f5 hatası için alttaki satır
COPY nginx.conf /etc/nginx/conf.d/default.conf

# (opsiyonel) kendi nginx konfigürasyonunu ekleyebilirsin
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]