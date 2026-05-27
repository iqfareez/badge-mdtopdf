FROM node:24-trixie
ENV NODE_ENV=production
WORKDIR /usr/src/app

# Install dependencies required for chrome (the chrome binary itself will be 
# downloaded by puppeteer in pnpm install)
# https://stackoverflow.com/a/71128432/13617136
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnspr4 \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libdbus-1-3 \
    libcups2 \
    libxkbcommon0 \
    libasound2 \
    libgbm1 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libatspi2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY ["package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml", ".puppeteerrc.cjs", "./"]
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build && pnpm prune --prod
EXPOSE 3000
RUN chown -R node /usr/src/app
USER node
CMD ["pnpm", "start"]
