define(['util/jquery', 'util/knockout'], function($, ko){
  var testUrlRegex = /^testUrl=.*$/;
      exports = {
        failed: false,
        testUrlProvided: ko.observable(location.search.substring(1))
      };

  if (!exports.testUrlProvided().match(testUrlRegex)){
    exports.failed = true;
  } else {
    var testUrl = exports.testUrlProvided().substring(8);
    
    window.registerTests = function(tests) {
      alert(tests);
    };

    //require([testUrl], function(){
      //alert('RequireJs Success');
    //});

    $.get(testUrl)
      .success(function(data) {
        alert('loaded test url');
      })
      .error(function() { alert('failed to load test url'); });
  }

  return exports;
});
