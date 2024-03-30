FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output to replace the default nginx contents.
COPY build/ /usr/share/nginx/html

# Expose port 80
EXPOSE 80

