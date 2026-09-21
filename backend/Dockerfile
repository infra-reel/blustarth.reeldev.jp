FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json ./
# package-lock.json がなくても動くよう npm install を使用
RUN npm install --omit=dev
COPY index.js ./
RUN mkdir -p data
EXPOSE 4000
CMD ["node", "index.js"]
