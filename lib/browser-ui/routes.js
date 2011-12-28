var serveStaticFiles,
    routeTable = {
      '/favicon.ico' : function(request, response){
        serveStaticFiles({
          url: '/content/images/jasmine_favicon.png',
          headers: {
            'if-none-match': {}
          },
          method: 'Stub'
        }, response);
      }
    };

exports.createRouter = function(staticFileRoute){
  serveStaticFiles = staticFileRoute;

  var router = function(request, response){
    routeTable[request.url](request, response);
  };

  router.isDefined = function(request){
    return routeTable[request.url];
  };

  return router;
};
