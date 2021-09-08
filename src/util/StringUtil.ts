namespace df {
    /**
     * 字符串工具.静态工具类
     */
    export class StringUtil {

        /**
         * 据字节长度截取字符串（英文一个字节，汉字两个字节）
         * @param length 字节长度
         * @param str 原字符串
         * @returns 截取后的字符串，过长会添加'..'结尾
         */
        public static getStrByByteLen(length, str) {
            var count = 0;
            var index = str.length - 1;
            for (var i = 0; i < str.length; i++) {
                if (str.charCodeAt(i) > 255) {
                    count += 2;
                } else {
                    count++;
                }
                if (count >= length) {
                    index = i;
                    break;
                }
            }
            if (index >= str.length - 1) {
                return str;
            }

            return str.substr(str, index + 1) + '..' || str;
        }

        /**
         * 反转字符串
         * @param str 
         * @returns 反转后的字符串
         */
        public static reverse(str: string): string {
            return str.split("").reverse().join("");
        }

        /**
         * 去掉字符串所有的回车换行
         * @param str 
         * @returns 无回车换行的字符串
         */
        public static removeEnter(str: string) {
            return str.replace(/[\n|\r|(\r\n)|(\u0085)|(\u2028)|(\u2029))]/g, "");
        }
    }
}