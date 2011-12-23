var Http = require('http'),
    io = require('socket.io'),
    paperboy = require('paperboy'),
    WEBROOT = require('path').join(__dirname, 'webRoot');

function serveStaticFiles(request, response){
  paperboy
    .deliver(WEBROOT, request, response)
    .before(function(){
      console.log('Received Request: ' + request.url);
    })
    .after(function(statCode) {
      console.log('Ended Request: ' + request.url + ' [' + statCode + ']');
    })
    .error(function(statCode, msg) {
      response.writeHead(statCode, {'Content-Type': 'text/plain'});
      response.end('Error ' + statCode);
      console.log('ERROR: ' + statCode + ' ' + request.url);
    })
    .otherwise(function(err){
      response.writeHead(404, {'Content-Type': 'text/plain'});
      response.end('Error 404: File not found');
      console.log('404: ' + request.url);
    });
};

exports.start = function(){
  var httpServer = Http.createServer(serveStaticFiles);

  httpServer.on('listening', function(){
    console.log('Server is up');
  });

  httpServer.listen(8888);
};
