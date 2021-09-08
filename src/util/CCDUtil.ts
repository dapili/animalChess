namespace df {
    /**
     * 连续碰撞检测，静态工具类
     * 
     * 默认步进为1，根据需要可适当加大以提升性能表现；无论结果是否碰撞，双方位置都会根据速度进行改变；
     * 
     * 矩形锚点在左上角，圆锚点在圆心
     */
    export class CCDUtil {
        public constructor() {

        }
        private static readonly RECT = "rect";
        private static readonly CIRCLE = "circle";

        /**
         * 矩形同矩形的ccd
         * @param rect1 
         * @param rect2 
         * @param step 
         * @returns 
         */
        public static rect2rect(
            rect1: { x, y, width, height, speed: { vx, vy } },
            rect2: { x, y, width, height, speed: { vx, vy } },
            step = 1) {

            return this.a2b({ ...rect1, shape: this.RECT, r: 0 }, { ...rect2, shape: this.RECT, r: 0 }, step)
        }

        private static a2b(
            a: { x, y, speed: { vx, vy }, shape, width, height, r },
            b: { x, y, speed: { vx, vy }, shape, width, height, r },
            step) {

            let loop = this.getLoop(a.speed, b.speed, step);
            let aStepSpeed: { vx, vy } = this.getStepSpeed(a.speed, loop);
            let bStepSpeed: { vx, vy } = this.getStepSpeed(b.speed, loop);

            let collision: boolean;
            for (let i = 0; i < loop; i++) {
                a.x += aStepSpeed.vx;
                a.y += aStepSpeed.vy;
                b.x += bStepSpeed.vx;
                b.y += bStepSpeed.vy;

                if (a.shape == b.shape && b.shape == this.RECT) {
                    if (df.CollisionUtil.rect2rect(a, b)) {
                        collision = true;
                        break
                    }
                }
                else if (a.shape == b.shape && b.shape == this.CIRCLE) {
                    if (df.CollisionUtil.circle2Circle(a, b)) {
                        collision = true;
                        break
                    }
                }
                else if (a.shape == this.RECT && b.shape == this.CIRCLE) {
                    if (df.CollisionUtil.rect2Circle(a, b)) {
                        collision = true;
                        break
                    }
                }
            }
            return collision;
        }

        private static getLoop(speed1: { vx, vy }, speed2: { vx, vy }, step) {
            let loop = Math.max(
                Math.abs(speed1.vx),
                Math.abs(speed1.vy),
                Math.abs(speed2.vx),
                Math.abs(speed2.vy)) / step;
            return Math.ceil(loop);
        }

        private static getStepSpeed(speed: { vx: number, vy: number }, step) {
            let stepSpeed: { vx: number, vy: number };
            stepSpeed.vx = speed.vx / step;
            stepSpeed.vy = speed.vy / step;
            return stepSpeed;
        }

        public static rect2Circle(
            rect: { x, y, width, height, speed: { vx, vy } },
            circle: { x, y, r, speed: { vx, vy } },
            step = 1) {

            return this.a2b({ ...rect, shape: this.RECT, r: 0 }, { ...circle, shape: this.CIRCLE, width: 0, height: 0 }, step);
        }

        public static circle2Circle(
            circle1: { x, y, r, speed: { vx, vy } },
            circle2: { x, y, r, speed: { vx, vy } },
            step = 1) {

            return this.a2b({ ...circle1, shape: this.CIRCLE, width: 0, height: 0 }, { ...circle2, shape: this.CIRCLE, width: 0, height: 0 }, step);
        }
    }
}