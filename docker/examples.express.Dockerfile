FROM node:14 as build
MAINTAINER sv2 <sv2@slana.tech>

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY packages/node ./packages/node
#COPY packages/ux ./packages/ux

RUN yarn install --pure-lockfile --non-interactive

WORKDIR /app/packages/node
RUN yarn build

FROM node:14-slim
MAINTAINER sv2 <sv2@slana.tech>

WORKDIR /app

COPY package.json .
COPY yarn.lock .

COPY --from=build /app/packages/node /app/packages/node
#COPY --from=build /app/packages/ux /app/packages/ux
#COPY --from=build /usr/src/app/packages/shared/dist /usr/src/app/packages/shared/dist

ENV NODE_ENV production

RUN yarn install --pure-lockfile --non-interactive --production

# Application
COPY /examples/express/*.js /examples/express/petstore.yaml /examples/express/entrypoint.sh /app/

ENTRYPOINT ["./entrypoint.sh"]
