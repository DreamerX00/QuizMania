# ws-server Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN if [ ! -f tsconfig.json ]; then echo 'tsconfig.json missing!'; exit 1; fi
RUN npm install -g typescript && tsc --outDir dist
EXPOSE 4000
CMD ["node", "dist/index.js"] 