namespace df {
	/**
	 * 事件总线
	 * @example
	 *	df.EventBus.instance.addEventListener("test", this.onTest, this);
	 *	private onTest(event) {
	 *		console.log(event.data)// {foo:"abc"}
	 *	}
	 *	df.EventBus.instance.emit("test", {foo:"abc"});
	 *	df.EventBus.instance.removeEventListener("test", this.onTest, this);
	 */
	export class EventBus {
		private constructor() {
		}
		private static _instance: EventBus;
		public static get instance() {
			if (!this._instance) {
				this._instance = new EventBus();
			}

			return this._instance;
		}

		private _listeners = {};

		/**
		 * 注册事件
		 * @param type 事件类型
		 * @param callback 事件响应回调
		 * @param scope 作用域
		 */
		public addEventListener(type: string, callback: Function, scope) {
			var args = [];
			var numOfArgs = arguments.length;
			for (var i = 0; i < numOfArgs; i++) {
				args.push(arguments[i]);
			}
			args = args.length > 3 ? args.splice(3, args.length - 1) : [];
			if (typeof this._listeners[type] != "undefined") {
				this._listeners[type].push({ scope: scope, callback: callback, args: args });
			} else {
				this._listeners[type] = [{ scope: scope, callback: callback, args: args }];
			}
		}

		/**
		 * 移除注册事件
		 * @param type 
		 * @param callback 
		 * @param scope 
		 */
		public removeEventListener(type: string, callback: Function, scope) {
			if (typeof this._listeners[type] != "undefined") {
				var numOfCallbacks = this._listeners[type].length;
				var newArray = [];
				for (var i = 0; i < numOfCallbacks; i++) {
					var listener = this._listeners[type][i];
					if (listener.scope == scope && listener.callback == callback) {

					} else {
						newArray.push(listener);
					}
				}
				this._listeners[type] = newArray;
			}
		}

		/**
		 * 派发事件
		 * @param type 
		 * @param data 
		 */
		public emit(type: string, data?) {
			var event = {
				type,
				data
			};
			var args = [];
			var numOfArgs = arguments.length;
			for (var i = 0; i < numOfArgs; i++) {
				args.push(arguments[i]);
			};
			args = args.length > 2 ? args.splice(2, args.length - 1) : [];
			args = [event].concat(args);

			if (typeof this._listeners[type] != "undefined") {
				var listeners = this._listeners[type].slice();
				var numOfCallbacks = listeners.length;
				for (var i = 0; i < numOfCallbacks; i++) {
					var listener = listeners[i];
					if (listener && listener.callback) {
						var concatArgs = args.concat(listener.args);
						listener.callback.apply(listener.scope, concatArgs);
					}
				}
			}
		}
	}
}