FROM image-docker.zuoyebang.cc/base/node-builder:12.14-alpine as builder

WORKDIR /app
COPY ./ /app/
RUN npm install && npm run build:prod


FROM image-docker.zuoyebang.cc/base/node-runner:12.14-alpine

ARG APP_NAME
ENV APP_NAME $APP_NAME

WORKDIR /home/homework/
COPY --from=builder /app/  /home/homework/

EXPOSE 3000
