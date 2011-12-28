var Http = require('http'),
    io = require('socket.io'),
    paperboy = require('paperboy'),
    less = require('less'),
    lessCompiled = {},
    path = require('path'),
    fs = require('fs'),
    WEBROOT = path.join(__dirname, 'webRoot'),
    router;

function route(request, response){
  if(router.isDefined(request)){
    router(request, response);
  } else if(request.url.match(/^.*\.css$/)){
    resolveCssRequests(request, response);
  } else {
    serveStaticFiles(request, response);
  }
};

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

function resolveCssRequests(request, response){
  console.log('LESS REQUEST: ' + request.url);

  if(!lessCompiled[request.url]){
    lessCompiled[request.url] = {
      lessPath: path.join(WEBROOT, request.url.replace(/\.css$/, '.less')),
      cssPath: path.join(WEBROOT, request.url)
    };
  }

  var hist = lessCompiled[request.url];

  fs.stat(hist.lessPath, function(lessStatErr, lessStat){
    if(lessStatErr){
      throw lessStatErr;
    }

    var lessModifiedDate = lessStat.mdate;

    path.exists(hist.lessPath, function(lessExists){
      if(!lessExists){
        serveStaticFiles(request, response);
        return;
      }

      path.exists(hist.cssPath, function(cssExists){
        if(!cssExists ||
           !hist.lessModifiedDate ||
           (hist.lessModifiedDate && lessModifiedDate > hist.lessModifiedDate)){
          var render = function(error){
            if(error){
              throw error;
            }

            fs.readFile(hist.lessPath, function(readErr, data){
              if(readErr){
                throw err;
              }

              lessOptions = {
                paths: [path.dirname(hist.lessPath)]
              };

              less.render(data.toString(), lessOptions, function(lessErr, css){
                if(lessErr){
                  throw lessErr;
                }

                fs.writeFile(hist.cssPath, css, function(writeErr){
                  if(writeErr){
                    throw writeErr;
                  }

                  hist.lessModifiedDate = lessModifiedDate;
                  serveStaticFiles(request, response);
                });
              });
            });
          };

          if(cssExists){
            fs.unlink(hist.cssPath, render);
            return;
          }

          render();
          return;
        }

        serveStaticFiles(request, response);
      });
    });
  });
};

exports.start = function(){
  var httpServer = Http.createServer(route);

  router = require('./routes').createRouter(serveStaticFiles);

  httpServer.on('listening', function(){
    console.log('Server is up');
    var childProcess = require('child_process').spawn('cmd');
    childProcess.stdin.write('start http://localhost:8888\n');
  });

  httpServer.listen(8888);
};
