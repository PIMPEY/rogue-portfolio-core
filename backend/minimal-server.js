const http = require('http');  
const server = http.createServer((req, res) = 
  res.writeHead(200, {'Content-Type': 'application/json'});  
  res.end(JSON.stringify({status: 'ok', dataMode: 'mock'}));  
});  
server.listen(3001, '0.0.0.0', () => console.log('Server running on 0.0.0.0:3001')); 
