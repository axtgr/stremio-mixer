FROM node:alpine

LABEL maintainer="me@schneider.ax"

WORKDIR /var/www/mixer
EXPOSE 80

COPY ./package.json /var/www/mixer/package.json
COPY ./build /var/www/mixer/build
COPY ./public /var/www/mixer/public
RUN npm install --silent --only=prod

CMD npm start
