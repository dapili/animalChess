namespace df {
	/**
	 * Get Post 请求工具.静态工具类
	 */
	export class HttpUtil {
		public constructor() {
		}

		/**
		 * 发送Post请求
		 * @param url 请求url
		 * @param params json对象，无参传空null
		 * @param success 成功回调
		 * @param fail 失败回调
		 */
		public static sendPostRequest(url: string, params: any, success: Function, fail: Function) {
			this.getRequest(url, params, success, fail, egret.HttpMethod.POST);
		}
		/**
		 * 
		 * @param url 
		 * @param params 始终传空null
		 * @param success 
		 * @param fail 
		 */
		public static sendGetRequest(url: string, params: any, success: Function, fail: Function): void {
			this.getRequest(url, null, success, fail, egret.HttpMethod.GET);
		}

		public static sendDeleteRequest(url: string, params: any, success: Function, fail: Function) {
			this.getRequest(url, params, success, fail, "DELETE");
		}

		private static getRequest(url: string, params: any, success: Function, fail: Function, type: string) {
			var request = new egret.HttpRequest();
			request.responseType = egret.HttpResponseType.TEXT;
			request.open(url, type);
			//设置响应头
			if (params) {
				request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
			}
			else if (type != egret.HttpMethod.GET) {
				request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			}
			request.send(params);
			request.addEventListener(egret.Event.COMPLETE, success, this);
			request.addEventListener(egret.IOErrorEvent.IO_ERROR, fail, this);
			// request.addEventListener(egret.ProgressEvent.PROGRESS,this.onPostProgress,this); //侦听进度
		}

		/**
		 * 获取请求响应数据
		 * @param event egret.Event
		 * @returns ""或json对象
		 */
		public static getResponseData(event) {
			var request = <egret.HttpRequest>event.currentTarget;
			let res = request.response;
			if (res == "") {
				return "";
			}
			else {
				return JSON.parse(res);
			}
		}

		//范例
		// private success(event: egret.Event): void {
		// 	var request = <egret.HttpRequest>event.currentTarget;
		// 	console.log("data : ", request.response);
		// }

		// private fail(event: egret.IOErrorEvent): void {
		// 	console.log("error : " + event);
		// }

		// private onProgress(event: egret.ProgressEvent): void {
		// 	console.log("progress : " + Math.floor(100 * event.bytesLoaded / event.bytesTotal) + "%");
		// }
	}
}