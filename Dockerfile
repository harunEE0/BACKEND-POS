#E:\learn-code\backend-pos\Dockerfile
FROM node:20.12.2


WORKDIR /POS-backend

COPY package*.json ./

RUN npm install 

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]