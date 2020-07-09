FROM --platform=$TARGETPLATFORM node:lts-slim  as builder

ARG VERSION
ENV VERSION=$VERSION

WORKDIR /usr/src/app

COPY package.json .

RUN npm install

COPY src .
COPY tsconfig.json .
COPY tsconfig.build.json .

RUN npm run build

FROM --platform=$TARGETPLATFORM node:lts-slim

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist /usr/src/app/dist

USER node

EXPOSE 3000

CMD ["node", "dist/src/main"]