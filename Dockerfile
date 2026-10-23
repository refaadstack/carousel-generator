FROM node:22-bookworm-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates fontconfig fonts-liberation \
    libnss3 libdbus-1-3 libatk1.0-0 libatk-bridge2.0-0 libgbm1 \
    libasound2 libxrandr2 libxkbcommon0 libxfixes3 libxcomposite1 \
    libxdamage1 libpango-1.0-0 libcairo2 libcups2 libdrm2 \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npx remotion browser ensure
RUN npx remotion bundle remotion/index.ts --out-dir remotion-serve
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
