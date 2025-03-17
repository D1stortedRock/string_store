const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const ngrok = require('ngrok');

// Function to start ngrok and return the public URL
async function startNgrok() {
    try {
      // Connect ngrok to your local HTTP server running on port 8080
      const url = await ngrok.connect(8080);
      console.log('ngrok URL:', url); // Ensure ngrok URL is correct
  
      // Save the ngrok URL to string.txt and commit to GitHub
      saveNgrokUrlToFile(url);
    } catch (err) {
      console.error('Error starting ngrok:', err);
    }
  }
  
  // Save ngrok URL to string.txt and commit to GitHub
  function saveNgrokUrlToFile(url) {
    const filePath = './string.txt';
    console.log('Saving ngrok URL to file:', url);

    try {
        fs.writeFileSync(filePath, url, 'utf8');
        console.log('ngrok URL saved to string.txt:', url);

        // Git commit and push the updated file to GitHub
        exec('git add string.txt');
        console.log('Git add successful.');

        exec('git push origin main --force "Update ngrok URL"');
        console.log('Git commit successful.');

        exec('git push origin main --force');
        console.log('Git push successful.');

    } catch (error) {
        console.error('Error writing to file or committing to GitHub:', error);
    }
}

// Create an HTTP server to handle requests
const server = http.createServer((req, res) => {
  // Handle different routes
  if (req.method === 'GET' && req.url === '/message') {
    res.writeHead(200, { 'Content-Type': 'application/json' });

    // Send a JSON message to the client
    res.end(JSON.stringify({ message: 'Hello, Client!' }));
  } else if (req.method === 'POST' && req.url === '/send-message') {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const receivedMessage = JSON.parse(body);
        console.log('Received message:', receivedMessage);

        // Send back a response
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ received: receivedMessage }));
      } catch (error) {
        console.error('Error parsing JSON:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON format' }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Route not found' }));
  }
});

// Start the HTTP server on port 8080
server.listen(7829, () => {
  console.log('HTTP server is running on http://localhost:7829');
  // Start ngrok when the server runs
  startNgrok();
});
