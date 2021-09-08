namespace df {
	/**
	 * 时间工具，静态工具类
	 */
	export class TimeUtil {
		public constructor() {
		}

		/**
		 * 判断当前是否在某一时间范围
		 * @param start 开始时间，年月日时，24小时制
		 * @param end 结束时间
		 * @returns 
		 * @example
		 *	如当前时间2021年7月21日14时，以下活动时间开始于2021年7月21日早8点，结束于下午3点
		 *	let start = '2021 7 21 8:00';
		 *	let end = '2021 7 21 15:00';
		 *	df.TimeUtil.inTimeRange(start, end) //结果true
		 */
		public static inTimeRange(start: string, end: string) {
			let now = new Date().getTime();
			let startTime = new Date(start).getTime();
			let endTime = new Date(end).getTime();

			if (startTime <= now && now <= endTime) {
				return true;
			}
			else {
				return false
			}
		}

		/**
		 * 时分秒(99:59:59)
		 * @param time 秒
		 * @returns 
		 */
		public static hms(time: number) {
			let hour = Math.floor(time / 3600);
			let minute = Math.floor(time / 60) % 60;
			let second = time % 60;

			let hstr = hour > 9 ? hour : "0" + hour;
			let mstr = minute > 9 ? minute : "0" + minute;
			let sstr = second > 9 ? second : "0" + second;

			return hstr + ":" + mstr + ":" + sstr;
		}

		/**
		 * 分秒(99:59)
		 * @param time 秒
		 * @returns 
		 */
		public static ms(time: number) {
			let minute = Math.floor(time / 60);
			let second = time % 60;

			let mstr = minute > 9 ? minute : "0" + minute;
			let sstr = second > 9 ? second : "0" + second;

			return mstr + ":" + sstr;
		}
	}

}