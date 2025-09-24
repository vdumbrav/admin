FROM node:22-alpine AS builder


ARG VITE_API_URL
ARG VITE_SWAGGER_URL
ARG VITE_APP_BASE_URL
ARG VITE_OIDC_AUTHORITY
ARG VITE_OIDC_CLIENT_ID
ARG VITE_OIDC_SCOPE

WORKDIR /app

COPY package.json package-lock.json ./
COPY src/ .
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.25-alpine

WORKDIR /usr/share/nginx/html

COPY --from=builder /app/dist .

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]