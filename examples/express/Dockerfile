FROM node:16-alpine AS builder

# Install dependencies for building native libraries
RUN apk add --update git openssh-client python3 make gcc g++

WORKDIR /workspace

# docker-build plugin copies everything needed for `yarn install` to `manifests` folder.
COPY manifests ./

RUN yarn install --immutable

# You can delete the cache folder after `yarn install` is done.
RUN rm -rf .yarn/cache

FROM node:16-alpine

WORKDIR /workspace

# Copy the installed dependencies from the previous stage.
COPY --from=builder /workspace ./

# docker-build plugin runs `yarn pack` in all workspace dependencies and copies them to `packs` folder.
COPY packs ./

#CMD yarn workspace @swaggerstats/examples-express start
CMD sh
