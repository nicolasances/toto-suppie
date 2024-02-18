# Use an official Node.js runtime as the base image
FROM nginx:1.17.1-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project to the working directory
COPY . .

# Build the React app for production
RUN npm run build

# Use a lightweight Node.js runtime as the base image
FROM nginx:alpine

# Remove the default nginx.conf
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom nginx.conf to the nginx configuration directory
COPY nginx.conf /etc/nginx/conf.d/

# Copy the build output from the build stage to the nginx public directory
COPY --from=build /app/build /usr/share/nginx/html

# Start nginx server when the container launches
CMD ["nginx", "-g", "daemon off;"]
