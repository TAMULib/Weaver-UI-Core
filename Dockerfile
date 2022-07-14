ARG COMMAND='start:registry'

FROM node:lts-slim as build

ARG COMMAND

ENV COMMAND ${COMMAND}

COPY . ./core

WORKDIR /core

RUN npm install

CMD npm run ${COMMAND}
