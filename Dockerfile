# Create the container from the alpine linux image
FROM alpine:3.7
ARG VUE_APP_GRAPHQL_HTTP
ARG VUE_APP_GRAPHQL_WS
ARG VUE_APP_TENANT_ID
ARG VUE_APP_CLIENT_ID
ARG VUE_APP_REDIRECT_URI

# apk behind proxy
ENV  http_proxy 'http://bsmchinternet:Proxybsmch@10.0.0.10:80'

# Add nginx and nodejs
RUN apk add --update nginx nodejs

# npm behind proxy
RUN npm config set proxy http://10.0.0.10:80
RUN npm config set https-proxy http://10.0.0.10:80

# Create the directories we will need
RUN mkdir -p /tmp/nginx/vue-single-page-app
RUN mkdir -p /var/log/nginx
RUN mkdir -p /var/www/html

# Copy the respective nginx configuration files
COPY nginx_config/nginx.conf /etc/nginx/nginx.conf
COPY nginx_config/default.conf /etc/nginx/conf.d/default.conf

# Set the directory we want to run the next commands for
WORKDIR /tmp/nginx/vue-single-page-app
# Copy our source code into the container
COPY . .

#adding proxy configuration to npm
#RUN npm config set proxy http://10.0.0.10:80
#RUN npm config set https-proxy http://10.0.0.10:80

# Install the dependencies, can be commented out if you're running the same node version
RUN npm install

#environment variables
ENV VUE_APP_GRAPHQL_HTTP=${VUE_APP_GRAPHQL_HTTP}
ENV VUE_APP_GRAPHQL_WS=${VUE_APP_GRAPHQL_WS}
ENV VUE_APP_TENANT_ID=${VUE_APP_TENANT_ID}
ENV VUE_APP_CLIENT_ID=${VUE_APP_CLIENT_ID}
ENV VUE_APP_REDIRECT_URI=${VUE_APP_REDIRECT_URI}


# run webpack and the vue-loader
RUN npm run build

# copy the built app to our served directory
RUN cp -r dist/* /var/www/html

# make all files belong to the nginx user
RUN chown nginx:nginx /var/www/html

# start nginx and keep the process from backgrounding and the container from quitting
CMD ["nginx", "-g", "daemon off;"]	
