namespace df {
	/**
	 * 斗兽棋数据格
	 */
	export class ACGrid {
		public constructor() {
		}

		public gridX: number;
		public gridY: number;
		/**是否为空 */
		public isEmpty: boolean;
		/**是否盖牌 */
		public isAsk: boolean;
		/**是否我方或者阵营0 */
		public isMe: boolean;

		/**
		 * 
		 * 象>狮>虎>豹>狼>狐>猫>鼠>象
		 * 
		 * 鼠，0
		 * 猫，1
		 * 狐，2
		 * 狼，3
		 * 豹，4
		 * 虎，5
		 * 狮，6
		 * 象，7
		 */
		public num: number;

		/**方向 */
		public dir: df.ACGridWay;
	}

}