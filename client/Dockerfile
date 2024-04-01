FROM nginx:alpine

# Copy the NGINX configuration template.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Copy the build output to replace the default nginx contents.
COPY build/ /usr/share/nginx/html

# Use a shell command to replace the PORT placeholder and start NGINX
CMD ["/bin/sh", "-c", "envsubst '$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
