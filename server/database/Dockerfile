FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8080
COPY package*.json ./
RUN npm ci --omit=dev
COPY app.js dealership.js review.js ./
COPY data/ ./data/
USER node
EXPOSE 8080
CMD ["node", "app.js"]
