FROM node:20-alpine AS build
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm exec nest build

FROM node:20-alpine
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate
WORKDIR /app
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/dist ./dist
RUN mkdir -p uploads
EXPOSE 4000
CMD ["node", "dist/main.js"]
