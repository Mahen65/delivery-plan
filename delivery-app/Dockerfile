# delivery-app/Dockerfile
# Dockerfile for building and serving the React frontend application.

# Stage 1: Build the React application
FROM node:18-alpine as builder

WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app for production
RUN npm run build

# Stage 2: Serve the React application with Nginx
FROM nginx:alpine

# Copy the built React app from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Optionally, copy a custom Nginx configuration if needed for more complex routing
# COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Command to run Nginx
CMD ["nginx", "-g", "daemon off;"]
