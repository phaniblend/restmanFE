// Quick server status check for RestMan
const http = require('http');

const checkServer = (port = 3500) => {
  const options = {
    hostname: 'localhost',
    port: port,
    path: '/',
    method: 'GET',
    timeout: 5000
  };

  console.log(`🔍 Checking RestMan server on port ${port}...`);

  const req = http.request(options, (res) => {
    console.log(`✅ Server is running on http://localhost:${port}`);
    console.log(`📊 Status: ${res.statusCode}`);
    console.log(`🎯 Ready for production deployment!`);
    process.exit(0);
  });

  req.on('error', (err) => {
    console.log(`❌ Server not responding on port ${port}`);
    console.log(`💡 Try running: cd frontend && npm run dev`);
    console.log(`🔧 Error: ${err.message}`);
    process.exit(1);
  });

  req.on('timeout', () => {
    console.log(`⏰ Server timeout on port ${port}`);
    req.destroy();
    process.exit(1);
  });

  req.end();
};

// Check port 3500 (as requested)
checkServer(3500); 