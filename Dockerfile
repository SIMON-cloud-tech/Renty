# ── Base image ──
FROM node:22-alpine
# ── Set working directory ──
WORKDIR /app

# ── Copy root package.json (for concurrently, if any) ──
COPY package*.json ./
RUN npm install || true

# ── BACKEND ──
COPY backend/ ./backend/
WORKDIR /app/backend
RUN npm install

# ── FRONTEND ──
WORKDIR /app
COPY client/ ./client/
WORKDIR /app/client
RUN npm install && npm run build

# ── Move built frontend to backend's static folder ──
WORKDIR /app
RUN mkdir -p ./backend/public
RUN cp -r ./client/dist/* ./backend/public/

# ── Expose port ──
EXPOSE 5000

#copy backend/data
COPY backend/data/ ./backend/data/
# ── Start backend ──
WORKDIR /app/backend
CMD ["node", "server.js"]