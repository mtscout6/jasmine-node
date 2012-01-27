define(['util/underscore', 'util/knockout', 'util/event-aggregator'], function(_, ko, ea){
  var exports = ko.observableArray([]),
      flatSuites = {},
      flatTests = {};

  ea.bind('reporter:SuiteCreated', function(event){
    var suiteModel = {
      id: event.data.id,
      name: event.data.name,
      collapsed : ko.observable(false),
      tests: ko.observableArray([]),
      toggleCollapsed: function(){
        this.collapsed(!this.collapsed());
      }
    };

    suiteModel.selected = ko.dependentObservable({
      read: function(){
              return _.all(this.tests(), function(t) { return t.selected(); });
            },
      write: function(value){
               for(var i = 0; i < this.tests().length; i++){
                 this.tests()[i].selected(value);
               }
             },
      owner: suiteModel
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
    suiteModel.state = ko.dependentObservable(function(){
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

    }, suiteModel);

    flatSuites[event.data.id] = suiteModel;
    exports.push(suiteModel);
  });

  ea.bind('reporter:TestCreated', function(event){
    var test = {
      id: event.data.id,
      suiteId: event.data.suiteId,
      name: event.data.name,
      selected: ko.observable(true),
      state: ko.observable('initial')
    };

    flatSuites[event.data.suiteId].tests.push(test);
    flatTests[event.data.id] = test;
  });

  return exports;
});
