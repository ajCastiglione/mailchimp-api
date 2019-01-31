FROM node:10

WORKDIR /app/server

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8443 

CMD ["npm", "start"]