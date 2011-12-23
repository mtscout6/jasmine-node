define(function () {
    var exports = {},
        registry = {};

    exports.bind = function (type, handler) {
        var handler = handler;
        if (registry.hasOwnProperty(type)) {
            registry[type].push(handler);
        }
        else {
            registry[type] = [handler];
        }
        return this;
    };

    exports.unbind = function (type, handler) {
        var handlers = registry[type],
            newHandlers = [],
            i, h;
        if (handlers) {
            for (i in handlers) {
                h = handlers[i];
                if (h === handler) continue;
                newHandlers.push(h);
            }
            registry[type] = newHandlers;
        }
        return this;
    };

    exports.trigger = function (event) {
        var array,
            func,
            handler,
            i, length,
            type = typeof event === 'string' ?
                    event : event.type;

        if (registry.hasOwnProperty(type)) {
            array = registry[type];
            for (i = 0, length = array.length; i < length; i++) {
                handler = array[i];
                func = handler;
                func.apply(this, [event]);
            }
        }
        return this;
    };

    return exports;
});
