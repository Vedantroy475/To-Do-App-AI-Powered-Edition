# ---------- STAGE 1: builder ----------
FROM node:20-bullseye AS builder
WORKDIR /workspace

# Install dependencies for build (including dev deps)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy all sources and build the frontend
COPY . .
# Build frontend (Vite default output -> ./dist)
RUN npm run build

# Optional debug: list contents to ensure dist exists (can be removed later)
RUN echo "==== Builder /workspace contents ====" && ls -la /workspace && echo "==== /workspace/dist contents ====" && ls -la /workspace/dist || true

# ---------- STAGE 2: runtime ----------
FROM node:20-bullseye-slim AS runtime
WORKDIR /app

# Install only production deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy production build + API server code from builder
COPY --from=builder /workspace/dist ./dist
COPY --from=builder /workspace/api ./api
COPY --from=builder /workspace/*.js ./
COPY --from=builder /workspace/*.json ./

# Expose port Cloud Run expects
ENV PORT=8080
EXPOSE 8080

# Start the functions-framework (uses the api/index.js target)
CMD ["npx", "functions-framework", "--target=api", "--source=api/index.js", "--port=8080"]
