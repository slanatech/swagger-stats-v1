FROM node:16-alpine

# Install dependencies for building native libraries
#RUN apk add --update git openssh-client python3 make gcc g++

WORKDIR /workspace

# docker-build plugin copies everything needed for `yarn install` to `manifests` folder.
COPY manifests ./

RUN yarn install --immutable --inline-builds

# docker-build plugin runs `yarn pack` in all workspace dependencies and copies them to `packs` folder.
COPY packs ./

CMD yarn workspace @swaggerstats/examples-hapi start
#CMD sh
