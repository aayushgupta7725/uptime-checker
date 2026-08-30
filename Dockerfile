FROM node:22-alpine

WORKDIR /app

COPY backend/package*.json ./

RUN apk add --no-cache python3 make g++

RUN npm install

COPY backend/ ./backend/
COPY frontend/ ./frontend/

RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "backend/server.js"]