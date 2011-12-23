define(['util/event-aggregator', 'lib/verdant'], function(ea){
  if(!verdant){
    throw new Exception('Verdant library does not exist in the global namespace.');
  }

  var BrowserReporter = function(){
    this.testCount = 0;
    this.failedTestCount = 0;
    this.start = 0;
  };

  BrowserReporter.prototype = {
    runnerStarted: function(message){},
    runnerCompleted: function(message){},
    scenarioCreated: function(message){
      ea.trigger({
        type: 'reporter:ScenarioCreated',
        data: {
          id: message.id,
          name: message.name
        }
      });
    },
    scenarioStarted: function(message){},
    scenarioFailed: function(message){},
    testCreated: function(message){
      ea.trigger({
        type: 'reporter:TestCreated',
        data: {
          id: message.id,
          scenarioId: message.scenarioId,
          name: message.name
        }
      });
    },
    testStarted: function(message){},
    testFinished: function(message){},
    testFailed: function(message){},
    log: function(message){}
  };

  return BrowserReporter;
});
