# Stage 1: Build the React application
FROM node:20-slim AS build
ARG VITE_API_URL=http://localhost:5000/api
ARG VITE_WS_URL=ws://localhost:5000
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
# Custom Nginx configuration to handle SPA routing (optional but recommended)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
