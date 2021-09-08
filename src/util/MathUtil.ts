namespace df {
	/**
	 * 数学工具，静态工具类
	 */
	export class MathUtil {
		constructor() {
		}

		/**
		 * 角度转弧度
		 * @param angle 
		 * @returns 
		 */
		public static angle2radian(angle: number): number {
			return angle / 180 * Math.PI;
		}

		/**
		 * 弧度转角度
		 * @param radian 
		 * @returns 
		 */
		public static radian2angle(radian: number): number {
			return radian / Math.PI * 180;
		}

		/**
		 * 源对象与目标对象的夹角
		 * @param source 
		 * @param target 
		 * @returns 角度
		 */
		public static pointerAngle(
			source: { x: number, y: number },
			target: { x: number, y: number }) {
			let radians = Math.atan2(target.y - source.y, target.x - source.x);
			return df.MathUtil.radian2angle(radians);
		}

		/**
		 * egret的指向方法
		 * @param source 
		 * @param target 
		 */
		public static egretToward(source, target) {
			source.rotation = this.pointerAngle(source, target) + 90;
		}

		/**
		 * cocosCreator的指向方法
		 * @param source 
		 * @param target 
		 */
		public static cocosToward(source, target) {
			source.angle = this.pointerAngle(source, target) - 90;
		}

		public static dis(p1: { x: number, y: number }, p2: { x: number, y: number }) {
			return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
		}

		public static equalInRange(a: number, b: number, range: number = 1e-4) {
			if (Math.abs(Math.abs(a) - Math.abs(b)) < range) {
				return true;
			}
			else {
				return false;
			}
		}

		/**
		 * 随机整数，取闭区间[min, max]
		 * @param min 
		 * @param max 
		 * @returns 
		 */
		public static randomInt(min: number, max: number): number {
			return min + Math.round((max - min) * Math.random())
		}

		/**
		 * 直线同圆的交点；x1,x2表直线点,x3,r表圆,锚点在圆心
		 * @returns 空数组或有两个交点的数组
		 */
		public static getLineCircleIntersectP(x1, y1, x2, y2, x3, y3, r) {
			if (x1 == x2) {
				let Y = r * r - (x1 - x3) * (x1 - x3);
				if (Y < 0) {
					return [];
				}
				else {
					return [{ x: x1, y: Math.sqrt(Y) + y3 }, { x: x1, y: -Math.sqrt(Y) + y3 }];
				}
			}
			// 直线y = kx + b;
			let k = (y1 - y2) / (x1 - x2);
			let b = y1 - k * x1;

			// 圆(x - x3)*(x - x3) + (y - y3)*(y - y3) = r*r; 转倾成Ax*x + Bx + C = 0求解;
			let A = k * k + 1;
			let B = 2 * k * b - 2 * x3 - 2 * k * y3;
			let C = x3 * x3 + y3 * y3 + b * b - r * r - 2 * b * y3;
			let delta = B * B - 4 * A * C;
			if (delta < 0) {
				return [];
			}
			else {
				let r1x = (-B + Math.sqrt(delta)) / (2 * A);
				let r1y = k * r1x + b;

				let r2x = (-B - Math.sqrt(delta)) / (2 * A);
				let r2y = k * r2x + b;

				return [{ x: r1x, y: r1y }, { x: r2x, y: r2y }];
			}
		}

		/**
		 * 直线同矩形的交点；x1,x2表直线点，x,widht表矩形,锚点在左上角；
		 * @returns 空数组或有不定交点的数组
		 */
		public static getLineRectIntersectP(x1, y1, x2, y2, x, y, width, height) {
			let rectLines = [
				[x, y, x + width, y], // 上线
				[x, y, x, y + height], // 左线
				[x, y + height, x + width, y + height], // 下线
				[x + width, y, x + width, y + height], // 右线
			]

			let interP = [];
			for (let i = 0; i < rectLines.length; i++) {
				let line = rectLines[i];
				let p: any = this.getLineLineIntersectP(x1, y1, x2, y2, line[0], line[1], line[2], line[3]);
				if (p != 1 && p != -1) {
					if (this.isPointInRectSo(p.x, p.y, x, y, width, height)) {
						interP.push(p);
					}
				}
			}
			return interP;
		}

		/**
		 * 直线同直线的交点；x1,x2表直线1，x3,x4表直线2；
		 * @returns 一个交点对象或1(同一直线)或-1(平行直线)
		 */
		public static getLineLineIntersectP(x1, y1, x2, y2, x3, y3, x4, y4) {
			let k1, k2, b1, b2;

			if (x1 == x2) {
				if (x3 == x4) {
					if (x1 == x3) {
						return 1;
					}

					return -1;
				}
				else {
					k2 = (y3 - y4) / (x3 - x4);
					b2 = y3 - k2 * x3;

					return { x: x1, y: k2 * x1 + b2 };
				}
			}
			else if (x3 == x4) {
				if (x1 == x2) {
					if (x3 == x1) {
						return 1;
					}

					return -1;
				}
				else {
					k1 = (y1 - y2) / (x1 - x2);
					b1 = y1 - k1 * x1;

					return { x: x3, y: k1 * x3 + b1 };
				}
			}

			k1 = (y1 - y2) / (x1 - x2);
			b1 = y1 - k1 * x1;
			k2 = (y3 - y4) / (x3 - x4);
			b2 = y3 - k2 * x3;

			if (k1 == k2) {
				if (b1 == b2) {
					return 1;
				}

				return -1;
			}

			let interX = (b2 - b1) / (k1 - k2);
			let interY = k1 * interX + b1;

			return { x: interX, y: interY };
		}

		/**
		 * 点是否在矩形上；pX表点，x,width表矩形，锚点在左上角
		 * @returns 
		 */
		public static isPointInRect(pX, pY, x, y, width, height) {
			return (pX >= x) && (pX <= x + width) && (pY >= y) && (pY <= y + height)
		}

		/**
		 * 点是否在矩形上；pX表点，x,width表矩形，锚点在左上角
		 * ***非精确0.0001误差***
		 * @returns 
		 */
		public static isPointInRectSo(pX, pY, x, y, width, height) {
			return (pX >= x || this.equalInRange(pX, x)) &&
				(pX <= x + width || this.equalInRange(pX, x + width)) &&
				(pY >= y || this.equalInRange(pY, y)) &&
				(pY <= y + height || this.equalInRange(pY, y + height))
		}

	}
}