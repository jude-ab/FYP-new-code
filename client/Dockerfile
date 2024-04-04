FROM nginx:alpine

COPY nginx.conf.template /etc/nginx/templates/default.conf.template

COPY build/ /usr/share/nginx/html

CMD ["/bin/sh", "-c", "envsubst '$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
