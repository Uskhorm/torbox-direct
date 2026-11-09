# Container entry for free Docker hosts (Hugging Face Spaces, Render, Koyeb, a VPS).
# Required secret: TORBOX_DIRECT_SECRET (32 random bytes, base64url). Reusing the
# secret from a previous host keeps existing install links valid; only the domain changes.
FROM node:24-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY . .
RUN chown -R node:node /app
USER node
ENV NODE_ENV=production HOST=0.0.0.0 PORT=7860
EXPOSE 7860
CMD ["node","--no-warnings","src/serve.mjs"]
