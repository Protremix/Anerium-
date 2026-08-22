FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production

COPY . .

# Build frontend will be copied to public/ at runtime
EXPOSE 3001

CMD ["node", "src/app.js"]
