const http = require('http');  
const server = http.createServer(function(req, res) {  
  console.log('Request:', req.method, req.url);  
  res.writeHead(200, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});  
