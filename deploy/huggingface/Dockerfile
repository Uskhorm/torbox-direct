# Hugging Face Space (Docker SDK). Builds TorBox Direct straight from GitHub.
# Space settings -> Variables and secrets -> add secret TORBOX_DIRECT_SECRET.
# To update the Space after a new GitHub release: Settings -> Factory rebuild.
FROM node:24-slim
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN git clone --depth 1 https://github.com/Uskhorm/torbox-direct.git . \
 && npm ci --omit=dev --ignore-scripts && npm cache clean --force \
 && rm -rf .git && chown -R node:node /app
USER node
ENV NODE_ENV=production HOST=0.0.0.0 PORT=7860
EXPOSE 7860
CMD ["node","--no-warnings","src/serve.mjs"]
