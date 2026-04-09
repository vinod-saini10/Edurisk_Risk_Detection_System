# Build stage
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . /app
RUN npm run build

# Production stage
FROM nginx:alpine
RUN apk add --no-cache wget
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
