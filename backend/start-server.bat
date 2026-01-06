@echo off  
echo Starting server...  
node -e "const http = require('http'); const server = http.createServer(function(req, res) { res.writeHead(200, {'Content-Type': 'application/json'}); if (req.url === '/health') { res.end(JSON.stringify({status: 'ok'})); } else { res.end(JSON.stringify({error: 'Not found'})); } }); server.listen(3001, '0.0.0.0', function() { console.log('Server running on 0.0.0.0:3001'); });"  
pause 
