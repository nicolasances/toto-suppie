FROM node:14-alpine as build

RUN mkdir /app
COPY . /app
WORKDIR /app

ARG SUPERMARKET_API_ENDPOINT
ARG AUTH_API_ENDPOINT
ARG GOOGLE_CLIENT_ID

RUN npm install
RUN REACT_APP_SUPERMARKET_API_ENDPOINT=$SUPERMARKET_API_ENDPOINT REACT_APP_AUTH_API_ENDPOINT=$AUTH_API_ENDPOINT REACT_APP_GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID npm run build

FROM nginx:alpine

COPY ./nginx.conf /etc/nginx/nginx.conf

RUN mkdir /app

# # Copy the build output from the build stage to the nginx public directory
COPY --from=build /app/build /app/build

# # Start nginx server when the container launches
CMD ["nginx", "-g", "daemon off;"]
