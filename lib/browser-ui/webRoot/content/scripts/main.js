require.config({
  baseUrl: 'content/scripts'
});

require(['util/event-aggregator'], function(ea){
  require.resourcesReady(function(){
    ea.trigger('PageLoadCompleted');
  });

  require(['testnavigator', 'testresults'], function(){
    for(var i = 0; i < 5; i++){
      ea.trigger({
        type: 'reporter:SuiteCreated',
        data: {
          id: i,
          name: 'Suite ' + i
        }
      });

      for(var j = 0; j < 10; j++){
        var testId = (j + 1) * (i + 1);

        ea.trigger({
          type: 'reporter:TestCreated',
          data: {
            id: testId,
            suiteId: i,
            name: 'Test ' + j
          }
        });
      }
    }
  });

  require(['test-loader'], function(loader){});
});
