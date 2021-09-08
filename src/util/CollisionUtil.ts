namespace df {
	/**
	 * 碰撞检测，静态工具类
	 * 
	 * 提供矩形与矩形，矩形与圆，圆与圆的检测，不支持旋转
	 * 
	 * 矩形锚点在左上角，圆锚点在圆心
	 */
	export class CollisionUtil {
		public constructor() {
		}
		
		/**
		 * 矩形同矩形的碰撞
		 * @param rect1 
		 * @param rect2 
		 * @returns 
		 */
		public static rect2rect(
			rect1: { x: number, y: number, width: number, height: number },
			rect2: { x: number, y: number, width: number, height: number }) {
			if (
				rect1.x + rect1.width < rect2.x ||
				rect1.y + rect1.height < rect2.y ||
				rect2.x + rect2.width < rect1.x ||
				rect2.y + rect2.height < rect1.y) {
				return false;
			}
			else {
				// 仅考虑一个动态的垂直4方向碰撞，判断rect1的上下左右被碰撞
			}
			return true;
		}

		public static rect2Circle(
			rect: { x: number, y: number, width: number, height: number },
			circle: { x: number, y: number, r: number }) {
			if ( // 圆套在4个角上
				df.MathUtil.dis(rect, circle) <= circle.r ||
				df.MathUtil.dis({ x: rect.x + rect.width, y: rect.y }, circle) <= circle.r ||
				df.MathUtil.dis({ x: rect.x + rect.width, y: rect.y + rect.height }, circle) <= circle.r ||
				df.MathUtil.dis({ x: rect.x, y: rect.y + rect.height }, circle) <= circle.r) {
				return true
			}
			else {
				if (this.rect2rect(rect, { x: circle.x - circle.r, y: circle.y - circle.r, width: 2 * circle.r, height: 2 * circle.r })) { // 矩形同圆外接矩形相交
					if ( // 圆心在4角的反方向延长所在的象限内
						circle.x < rect.x && circle.y < rect.y ||
						circle.x > rect.x + rect.width && circle.y < rect.y ||
						circle.x > rect.x + rect.width && circle.y > rect.y + rect.height ||
						circle.x < rect.x && circle.y > rect.y + rect.height) {
						return false;
					}
					return true;
				}
				else {
					return false;
				}
			}
		}

		public static circle2Circle(
			c1: { x: number, y: number, r: number },
			c2: { x: number, y: number, r: number }) {
			return df.MathUtil.dis(c1, c2) < c1.r + c2.r;
		}

	}

}