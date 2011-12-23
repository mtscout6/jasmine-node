define(['util/underscore', 'util/knockout', 'util/event-aggregator'], function(_, ko, ea){
  var exports = ko.observableArray([]),
      flatScenarios = {},
      flatTests = {};

  ea.bind('reporter:ScenarioCreated', function(event){
    var scenarioModel = {
      id: event.data.id,
      name: event.data.name,
      tests: ko.observableArray([])
    };

    scenarioModel.selected = ko.dependentObservable({
      read: function(){
              return _.all(this.tests(), function(t) { return t.selected(); });
            },
      write: function(value){
               for(var i = 0; i < this.tests().length; i++){
                 this.tests()[i].selected(value);
               }
             },
      owner: scenarioModel
    });

    // Possible States:
    //   - initial: no action has been taken
    //   - pending: awaiting to be executed by the runner
    //   - running: currently executing
    //   - skipped: test was marked to be ignored
    //   - failed: at least one test failed
    //   - passed: all tests passed
    //
    //   - runningFailed: at least one test has failed, yet a test is still running
    //   - runningPassed: no tests have failed, at least one test has passed, and a test is still running
    //   - runningSkipped: no tests have failed, at least one test has been skipped, and a test is still running
    scenarioModel.state = ko.dependentObservable(function(){
      var counts = {
        initial: 0,
        pending: 0,
        running: 0,
        skipped: 0,
        failed: 0,
        passed: 0
      },
      testCount = this.tests().length;

      for (var i = 0; i < testCount; i++){
        counts[this.tests()[i].state()]++;
      }

      if (testCount === counts.initial){
        return 'initial';
      }

      if (counts.running > 0){
        if (counts.failed > 0) { return 'runningFailed'; }
        if (counts.skipped > 0) { return 'runningSkipped'; }
        if (counts.passed > 0) { return 'runningPassed'; }

        return 'running';
      } else {
        if (counts.failed > 0) { return 'failed'; }
        if (counts.skipped > 0) { return 'skipped'; }
        if (counts.passed > 0) { return 'passed'; }

        return 'pending';
      }

    }, scenarioModel);

    flatScenarios[event.data.id] = scenarioModel;
    exports.push(scenarioModel);
  });

  ea.bind('reporter:TestCreated', function(event){
    var test = {
      id: event.data.id,
      scenarioId: event.data.scenarioId,
      name: event.data.name,
      selected: ko.observable(true),
      state: ko.observable('initial')
    };

    flatScenarios[event.data.scenarioId].tests.push(test);
    flatTests[event.data.id] = test;
  });

  return exports;
});
