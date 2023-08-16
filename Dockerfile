FROM node:18
WORKDIR /OOTP-Simbot-V3/src
COPY . .
RUN npm install && npm cache clean --force && npm install -g typescript
CMD ["npm", "run", "build"]
