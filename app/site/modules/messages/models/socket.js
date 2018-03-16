var app = angular.module('quickRabbit.messages');
app.factory('socket', socket);
function socket($rootScope) {
	var socket = io.connect('/chat'),
		events = {},
		that = {};

	var addCallback = function (name, callback) {
		var event = events[name],
			wrappedCallback = wrapCallback(callback);

		if (!event) {
			event = events[name] = [];
		}

		event.push({ callback: callback, wrapper: wrappedCallback });
		return wrappedCallback;
	};

	var removeCallback = function (name, callback) {
		var event = events[name],
			wrappedCallback;

		if (event) {
			for (var i = event.length - 1; i >= 0; i--) {
				if (event[i].callback === callback) {
					wrappedCallback = event[i].wrapper;
					event.slice(i, 1);
					break;
				}
			}
		}
		return wrappedCallback;
	};

	var removeAllCallbacks = function (name) {
		delete events[name];
	};

	var wrapCallback = function (callback) {
		var wrappedCallback = angular.noop;

		if (callback) {
			wrappedCallback = function () {
				var args = arguments;
				$rootScope.$apply(function () {
					callback.apply(socket, args);
				});
			};
		}
		return wrappedCallback;
	};

	var listener = function (name, callback) {
		return {
			bindTo: function (scope) {
				if (scope !== null) {
					scope.$on('$destroy', function () {
						that.removeListener(name, callback);
					});
				}
			}
		};
	};
	return {
		on: function (name, callback) {
			socket.on(name, addCallback(name, callback));
			return listener(name, callback);
		},
		once: function (name, callback) {
			socket.once(name, addCallback(name, callback));
			return listener(name, callback);
		},
		removeListener: function (name, callback) {
			socket.removeListener(name, removeCallback(name, callback));
		},
		removeAllListeners: function (name) {
			socket.removeAllListeners(name);
			removeAllCallbacks(name);
		},
		emit: function (name, data, callback) {
			if (callback) {
				socket.emit(name, data, wrapCallback(callback));
			}
			else {
				socket.emit(name, data);
			}
		}
	};
}