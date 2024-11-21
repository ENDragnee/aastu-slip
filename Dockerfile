# Use the Node.js 19 image
FROM node:19-alpine

# Set environment variables for production mode
ENV NODE_ENV=production

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies
# RUN npm install tailwindcss-animate class-variance-authority lucide-react

# Copy the rest of the application code
COPY . .

# Build the Next.js app with the App Router and `src` folder structure
RUN npm run build

# Expose the port Next.js will run on
EXPOSE 3000

# Command to run the app
CMD ["npm", "run", "start"]
