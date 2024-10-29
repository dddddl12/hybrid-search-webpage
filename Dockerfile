# Use nginx to serve static files
FROM nginx:alpine

# Set the default Nginx port to match Cloud Run's default port
RUN sed -i 's/80/8080/g' /etc/nginx/conf.d/default.conf

# Copy static files from the Vite build output
COPY dist /usr/share/nginx/html

# Expose the port that matches Cloud Run's default
EXPOSE 8080

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
