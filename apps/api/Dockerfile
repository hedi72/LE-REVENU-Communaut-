FROM node:22-bookworm-slim
WORKDIR /app
ENV STRAPI_TELEMETRY_DISABLED=true
COPY package.json package-lock.json .npmrc ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci --include=optional --no-audit --no-fund
COPY apps/api apps/api
RUN npm run build --workspace @lerevenu/api
RUN chown -R node:node /app/apps/api
USER node
EXPOSE 1337
CMD ["npm", "run", "start", "--workspace", "@lerevenu/api"]
