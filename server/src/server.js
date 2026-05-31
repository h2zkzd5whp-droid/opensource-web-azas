require('dotenv').config();
const { execSync } = require('child_process');
const app = require('./app');

const requiredImages = [
    'python:3.12-slim',
    'node:20-slim',
    'eclipse-temurin:17-jre-jammy',
    'gcc:latest',
    'golang:1.21-alpine',
    'ruby:3.2-slim'
];

function initializeDockerImages() {
    console.log("Server Initialization: Checking execution environment (Docker)...");
    
    requiredImages.forEach(image => {
        try {
            execSync(`docker inspect ${image}`, { stdio: 'ignore' });
            console.log(`${image} Available`);
        } catch (e) {
            console.log(`${image} Downloading image... (This may take some time)`);
            execSync(`docker pull ${image}`);
            console.log(`${image} Ready`);
        }
    });
    console.log("All execution environments are ready");
}

try {
    initializeDockerImages();
} catch (err) {
    console.error("Docker environment initialization failed: Please check if Docker is installed and running.");
}

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
