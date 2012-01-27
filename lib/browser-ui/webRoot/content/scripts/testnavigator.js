define(['util/jquery', 'util/underscore', 'util/knockout', 'util/event-aggregator', 'suite-collection-view-model'],
    function($, _, ko, ea, suites){
  var $navigator = $('#TestNavigator'),
      viewModel = {
        suites: suites,
        run: function(){
          ea.trigger('navigation:ClearOldResults');

          var testIdsToRun = _(this.suites()).chain()
            .map(function(s) { return s.tests(); })
            .flatten()
            .select(function (t) {
              t.state(t.selected() ? 'pending' : 'initial');
              return t.selected();
            })
            .map(function(t) { return t.id; })
            .value();

          ea.trigger({
            type: 'navigation:RunTests',
            testsIdsToRun: testIdsToRun
          });
        },
      };

  ko.applyBindings(viewModel, $navigator[0]);
});
