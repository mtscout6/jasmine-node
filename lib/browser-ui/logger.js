var _ = require('underscore'),
    levels = [
      'error',
      'warn',
      'info',
      'debug'
    ],
    colors = [
      31,
      33,
      36,
      90
    ],
    pad = function (str) {
      var max = 0;

      for (var i = 0, l = levels.length; i < l; i++)
        max = Math.max(max, levels[i].length);

      if (str.length < max)
        return str + new Array(max - str.length + 1).join(' ');

      return str;
    },
    Logger = module.exports = function(config){
      config = config || {};

      this.colors = false !== config.colors;
      this.level = 3;
    };

Logger.prototype.log = function(level) {
  var index = levels.indexOf(level),
      prefix = this.colors
        ? '\033[' + colors[index] + 'm' + pad(level) + ' -\033[39m'
        : level + ':';

  if (index > this.level)
    return this;

  console.log.apply(console, [prefix].concat(_.toArray(arguments).slice(1)));

  return this;
};

levels.forEach(function (level) {
  Logger.prototype[level] = function() {
    this.log.apply(this, [level].concat(_.toArray(arguments)));
  };
});
