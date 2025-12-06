#Backend
FROM node:21

# Set working directory
WORKDIR /app

# Copy package.json & package-lock.json first
COPY package*.json ./

# Install dependencies inside the container
# --build-from-source ensures native modules like bcrypt compile for Linux
RUN npm install --build-from-source

# Copy the rest of the application
COPY . .

# Expose app port
EXPOSE 4000

# Start the app
CMD ["node", "start.js"]
