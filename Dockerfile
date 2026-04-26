FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies first for better layer caching.
COPY package.json package-lock.json ./
RUN npm ci

# Allow overriding Vite API URL at build time.
ARG VITE_API_URL=http://localhost:8000/api/v0
ENV VITE_API_URL=${VITE_API_URL}

COPY . .
RUN npm run build-only

FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
