FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npx prisma generate

EXPOSE 4000
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node src/index.js"]
