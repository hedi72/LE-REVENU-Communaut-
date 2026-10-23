FROM node:22-bookworm-slim
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json .npmrc ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci --include=optional --no-audit --no-fund
COPY apps/web apps/web
RUN npm run build --workspace @lerevenu/web
RUN chown -R node:node /app/apps/web
USER node
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "@lerevenu/web"]
