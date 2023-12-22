FROM node:20

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install --legacy-peer-deps

COPY ./ ./

RUN npm install --global pm2


RUN npm run build

CMD ["pm2-runtime","start","dist/main.js"] 

