FROM fry-farm-backend:latest AS base

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=prod

COPY . .

EXPOSE 5000

CMD ["node", "index.js"]
