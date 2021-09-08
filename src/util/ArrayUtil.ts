namespace df {
	/**
	 * 数组工具，静态工具类
	 */
	export class ArrayUtil {
		public constructor() {
		}

		/**
		 * 随机打乱数组
		 * @param arr 
		 * @returns 打乱后的数组
		 */
		public static random(arr: Array<any>) {
			arr.sort((a, b): number => {
				return Math.random() > 0.5 ? 1 : -1;
			})
			return arr;
		}

		public static getRandomItem(arr: Array<any>) {
			return arr[Math.floor(arr.length * Math.random())];
		}

		/**
		 * 若arr1中存在有arr2的元素，则从arr1中剔除
		 * @param arr1 
		 * @param arr2 
		 * @returns 返回剔除后的arr1
		 */
		public static cull(arr1: Array<any>, arr2: Array<any>): Array<any> {
			let index: number = -1;
			for (let i = 0; i < arr2.length; i++) {
				index = arr1.indexOf(arr2[i]);
				if (index != -1) {
					arr1.splice(index, 1);
				}
			}
			return arr1;
		}

		/**
		 * 按对象的key,升序排序；
		 * @param key 
		 * @param arr 
		 * @returns 排序后数组
		 */
		public static sortAscBy(key: string, arr: Array<any>) {
			arr.sort((a, b): number => {
				if (a[key] < b[key]) {
					return -1;
				}
				else if (a[key] > b[key]) {
					return 1;
				}
				else {
					return 0;
				}
			})

			return arr;
		}

		/**
		 * 按对象的key,降序排序；
		 * @param key 
		 * @param arr 
		 * @returns 排序后数组
		 */
		public static sortDesBy(key: string, arr: Array<any>) {
			return this.sortAscBy(key, arr).reverse();
		}

		public static includes(arr: Array<any>, item: any) {
			return arr.indexOf(item) != -1;
		}

		public static maxNum(arr) {
			let r = -1;
			for (let i = 0; i < arr.length; i++) {
				if (r < arr[i]) {
					r = arr[i];
				}
			}
			return r;
		}
	}
}