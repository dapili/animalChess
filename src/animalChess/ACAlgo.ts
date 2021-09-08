namespace df {
	/**
	 * 4*4斗兽棋算法
	 * @example
	 *	let ac = new df.ACAlgo();
	 *	ac.initGrids();
	 *
	 *	df.EventBus.instance.addEventListener(df.ACAlgo.FLOP, flop, this);
	 *	df.EventBus.instance.addEventListener(df.ACAlgo.EATING, eat, this);
	 *	df.EventBus.instance.addEventListener(df.ACAlgo.MOVE, move, this);
	 *	df.EventBus.instance.addEventListener(df.ACAlgo.WIN, win, this);
	 *
	 *	flop(event) {ac.flop(event);}
	 *	eat(event) {ac.eat(event);}
	 *	move(event) {ac.move(event);}
	 *	win(event) {ac.win(event);}  
	 *
	 *	ac.auto(0);
	 *	ac.auto(1);
	 */
	export class ACAlgo {
		public constructor() {
		}

		/**
		 * 棋盘数据，可按长度16成4*4行列设置
		 */
		public grids: Array<ACGrid>;

		/**
		 * 初始化随机棋盘
		 */
		public initGrids() {
			if (!this.grids) {
				this.grids = [];
			}
			else {
				this.grids.length = 0;
			}

			for (let i = 0; i < 16; i++) {
				let grid = new ACGrid();
				grid.num = i % 8;
				grid.isEmpty = false;
				grid.isAsk = true;
				grid.isMe = i > 7 ? false : true;
				this.grids.push(grid);
			}

			df.ArrayUtil.random(this.grids);

			for (let i = 0; i < this.grids.length; i++) {
				let grid = this.grids[i];
				grid.gridX = i % 4;
				grid.gridY = Math.floor((i / 4));
			}
		}

		private print() {
			let line = 0;
			let str = "";
			for (let i = 0; i < this.grids.length; i++) {
				let grid = this.grids[i];
				if (line != grid.gridY) {
					line = grid.gridY;
					str += "\n";
				}

				if (grid.isEmpty) {
					str += "_ ";
				}
				else if (grid.isAsk) {
					str += "? ";
				}
				else if (grid.isMe) {
					str += `${this.getAnimalName(grid.num)} `;
				}
				else {
					str += `${grid.num} `;
				}
			}

			console.log(str);
			console.log("*************************************")
		}

		private _animalNames = ["鼠", "猫", "狐", "狼", "豹", "虎", "狮", "象"];
		public getAnimalName(num: number) {
			if (num == -1) {
				return "无";
			}
			return this._animalNames[num];
		}

		private _winSteps = [];
		private _failSteps = [];
		private _tieSteps = [];
		private _winMax;
		private _failMax;
		private _tieMax;
		private _camp;

		/**
		 * 自动下棋，双方皆可
		 * @param camp 0代表我方，1代表对方
		 */
		public auto(camp: number) {
			this._camp = camp;
			this._winSteps = [];
			this._failSteps = [];
			this._tieSteps = [];
			let win = [];
			let fail = [];
			let tie = [];
			for (let i = 0; i < this.grids.length; i++) {
				let enemy = this.grids[i];
				if (!enemy.isMe && !enemy.isEmpty && !enemy.isAsk) {
					let roundGrids = this.selectRoundGrid(enemy);
					for (let j = 0; j < roundGrids.length; j++) {
						let me = roundGrids[j];
						if (me.isMe && !me.isEmpty && !me.isAsk) {
							if (this._camp == 1) {
								this.winFailArr(enemy, me, win, fail, tie); //对手看待的胜负
							}
							else {
								this.winFailArr(me, enemy, win, fail, tie); //我看待的胜负
							}
						}
					}
				}
			}

			this._winSteps.sort((a, b) => {
				if (a.me.num > b.me.num) {
					return -1;
				}
				else if (a.me.num < b.me.num) {
					return 1;
				}
				else {
					return 0;
				}
			})

			this._failSteps.sort((a, b) => {
				if (a.enemy.num > b.enemy.num) {
					return -1;
				}
				else if (a.enemy.num < b.enemy.num) {
					return 1;
				}
				else {
					return 0;
				}
			})

			this._tieSteps.sort((a, b) => {
				if (a.enemy.num > b.enemy.num) {
					return -1;
				}
				else if (a.enemy.num < b.enemy.num) {
					return 1;
				}
				else {
					return 0;
				}
			})

			this._winMax = df.ArrayUtil.maxNum(win);
			this._failMax = df.ArrayUtil.maxNum(fail);
			this._tieMax = df.ArrayUtil.maxNum(tie);

			let opt: ACCampOpt;
			if (this._winMax > this._failMax) { //吃棋
				opt = ACCampOpt.EAT;
			}
			else if (this._winMax < this._failMax) { //躲避
				opt = ACCampOpt.RUN;
				if (this._winSteps[0] && (this._winSteps[0].enemy.num == this._failMax)) { // 将要被吃掉的,其实可以吃别人
					opt = ACCampOpt.EAT;
				}
			}
			else if (this._winMax == this._failMax && this._winMax != -1) { // 非是tie，各论各
				opt = ACCampOpt.EAT; // 优先吃
			}
			else {
				if (this._tieMax != -1) {
					opt = ACCampOpt.TIE;
				}
				else {
					opt = ACCampOpt.FLOP;
				}
			}

			if (!this.isFloped()) { //尚未翻过牌，得先翻牌
				opt = ACCampOpt.FLOP;
			}

			console.log(
				`胜_${this.getAnimalName(this._winMax)}`,
				`负_${this.getAnimalName(this._failMax)}`,
				`平_${this.getAnimalName(this._tieMax)}`);

			this.action(opt);
		}

		private winFailArr(enemy, me, win, fail, tie) {
			let vsr = this.checkVSR(enemy, me); //对手看待的胜负
			switch (vsr) {
				case ACChessVS.WIN:
					if (!this.isInQueue(enemy, me, this._winSteps)) {
						this._winSteps.push({ enemy, me });
					}
					if (!df.ArrayUtil.includes(win, me.num)) {
						win.push(me.num);
					}
					break;
				case ACChessVS.FAIL:
					if (!this.isInQueue(enemy, me, this._failSteps)) {
						this._failSteps.push({ enemy, me });
					}
					if (!df.ArrayUtil.includes(fail, enemy.num)) {
						fail.push(enemy.num);
					}
					break;
				case ACChessVS.TIE:
					if (!this.isInQueue(enemy, me, this._tieSteps)) {
						this._tieSteps.push({ enemy, me });
					}
					if (!df.ArrayUtil.includes(tie, enemy.num)) {
						tie.push(enemy.num);
					}
					break;
				default:
					break;
			}
		}

		private checkVSR(me: ACGrid, enemy: ACGrid) {
			let vsr: ACChessVS;
			if (me.num > enemy.num) {
				vsr = ACChessVS.WIN;
				if (me.num == 7 && enemy.num == 0) {
					vsr = ACChessVS.FAIL;
				}
			}
			else if (me.num == enemy.num) {
				vsr = ACChessVS.TIE;
			}
			else if (me.num < enemy.num) {
				vsr = ACChessVS.FAIL;
				if (me.num == 0 && enemy.num == 7) {
					vsr = ACChessVS.WIN;
				}
			}
			return vsr;
		}

		private isInQueue(enemy: ACGrid, me: ACGrid, arr) {
			let r = false;
			for (let i = 0; i < arr.length; i++) {
				if ((arr[i].enemy.gridX == enemy.gridX) &&
					(arr[i].enemy.gridY == enemy.gridY) &&
					(arr[i].me.gridX == me.gridX) &&
					(arr[i].me.gridY == me.gridY)) {
					r = true;
					break;
				}
			}
			return r;
		}

		/**
		 * 是否开过牌，全是？号
		 * @returns 
		 */
		private isFloped() {
			let r = false;
			for (let i = 0; i < this.grids.length; i++) {
				if (!this.grids[i].isAsk) {
					r = true;
					break;
				}
			}
			return r;
		}

		/**
		 * 还有未翻的牌，尚有？号
		 * @returns 
		 */
		private hasAsk() {
			let r = false;
			for (let i = 0; i < this.grids.length; i++) {
				if (this.grids[i].isAsk) {
					r = true;
					break;
				}
			}
			return r;
		}

		public static EATING = "acalgo_eating";
		public static MOVE = "acalgo_move";
		public static FLOP = "acalgo_flop";
		public static WIN = "acalgo_win";

		private action(opt: ACCampOpt) {
			switch (opt) {
				case ACCampOpt.EAT:
					console.log(`阵营_${this._camp} 吃`);
					let win = this._winSteps[0];
					let enemy = win.enemy;
					let me = win.me;
					df.EventBus.instance.emit(ACAlgo.EATING, { eating: enemy, eated: me });
					break;
				case ACCampOpt.RUN:
					console.log(`阵营_${this._camp} 跑`);
					this.chessRun();
					break;
				case ACCampOpt.TIE:
					console.log(`阵营_${this._camp} 拼`);
					if (this._tieMax != -1) {
						let tie = this._tieSteps[0];
						df.EventBus.instance.emit(ACAlgo.EATING, { eating: tie.enemy, eated: tie.me });
					}
					else {
						this.action(ACCampOpt.FLOP);
					}
					break;
				case ACCampOpt.FLOP:
					console.log(`阵营_${this._camp} 翻`);
					let asks: Array<ACGrid> = [];
					for (let i = 0; i < this.grids.length; i++) {
						if (this.grids[i].isAsk) {
							asks.push(this.grids[i]);
						}
					}

					df.ArrayUtil.random(asks);

					if (asks.length > 0) {
						df.EventBus.instance.emit(ACAlgo.FLOP, { flop: asks[0] });
					}
					else {
						this.action(ACCampOpt.MOVE);
					}
					break;
				default: // 瞎走一步；
					console.log(`阵营_${this._camp} 瞎`);
					this.moveRandom();
					break;
			}

		}

		/**
		 * 吃子
		 * @param event 
		 */
		public eat(event) {
			let eating: ACGrid = event.data.eating;
			let eated: ACGrid = event.data.eated;
			console.log(`阵营_${this._camp}${this.getAnimalName(eating.num)}去吃${this.getAnimalName(eated.num)}`)

			let vsr = this.checkVSR(eating, eated);
			switch (vsr) {
				case ACChessVS.WIN:
					eated.num = eating.num;
					eated.isMe = eating.isMe;
					eating.isEmpty = true;
					break;
				case ACChessVS.FAIL:
					eating.isEmpty = true;
					break;
				case ACChessVS.TIE:
					eated.isEmpty = eating.isEmpty = true;
					break;
			}

			this.print();
			this.checkRoundVS();
		}

		private _valueRun;
		private _canRun;
		private chessRun() {
			let maySafe = [];
			for (let i = 0; i < this._failSteps.length; i++) {
				let enemy: ACGrid;
				enemy = this._failSteps[i].enemy;
				let gridDatas = this.selectRoundGrid(enemy);

				for (let j = 0; j < gridDatas.length; j++) {
					if (gridDatas[j].isEmpty) {
						gridDatas[j].num = enemy.num;
						gridDatas[j].isEmpty = false;
						enemy.isEmpty = true;
						//查看是否还有危险；
						if (!this.dangerous(gridDatas[j])) {
							maySafe.push({ enemy, grid: gridDatas[j] });
						}
						//数据还原
						gridDatas[j].isEmpty = true;
						enemy.isEmpty = false;
					}
				}
			}

			maySafe.sort((a, b) => {
				if (a.enemy.num > b.enemy.num) {
					return -1;
				}
				else if (a.enemy.num < b.enemy.num) {
					return 1;
				}
				else {
					return 0;
				}

			})

			let valueSafe;
			this._valueRun = false;
			if (maySafe.length > 0) {
				for (let i = 0; i < maySafe.length; i++) {
					if (this._winMax < maySafe[i].enemy.num) { //价值逃脱
						this._valueRun = true;
						valueSafe = maySafe[i];
						break
					}
				}
			}

			this._canRun = false;
			if (maySafe.length > 0 && !this._valueRun) {
				this._canRun = true;
			}

			if (this._valueRun) {
				df.EventBus.instance.emit(ACAlgo.MOVE, { src: valueSafe.enemy, target: valueSafe.grid });
			}
			else if (this._canRun) {
				df.EventBus.instance.emit(ACAlgo.MOVE, { src: maySafe[0].enemy, target: maySafe[0].grid });
			}
			else {
				this.action(ACCampOpt.TIE);
			}
		}

		private selectRoundGrid(chess: ACGrid) {
			let r = [];
			for (let i = 0; i < this.grids.length; i++) {
				let data = this.grids[i];
				if (chess.gridX == data.gridX && chess.gridY == data.gridY + 1) { // 上面
					data.dir = ACGridWay.UP;
					r.push(data);
				}
				if (chess.gridX == data.gridX && chess.gridY == data.gridY - 1) { // 下面
					data.dir = ACGridWay.DOWN;
					r.push(data);
				}
				if (chess.gridX == data.gridX + 1 && chess.gridY == data.gridY) { // 左
					data.dir = ACGridWay.LEFT;
					r.push(data);
				}
				if (chess.gridX == data.gridX - 1 && chess.gridY == data.gridY) { // 右
					data.dir = ACGridWay.RIGHT;
					r.push(data);
				}
			}

			return r;
		}

		private dangerous(me: ACGrid) {
			let r = false;
			let gridDatas = this.selectRoundGrid(me);
			for (let i = 0; i < gridDatas.length; i++) {
				let enemy: ACGrid = gridDatas[i];
				if (!enemy.isEmpty && !enemy.isAsk && enemy.isMe != me.isMe) {
					let vsr = this.checkVSR(me, enemy);
					if (vsr == ACChessVS.FAIL) {
						r = true;
						break;
					}
				}
			}
			return r;;
		}

		/**
		 * 移动
		 * @param event 
		 */
		public move(event) {
			let src: ACGrid = event.data.src;
			let target: ACGrid = event.data.target;

			console.log(`阵营_${this._camp} ${this.getAnimalName(src.num)}移动${target.gridX}_${target.gridY}`);

			src.isEmpty = true;
			target.isEmpty = false;
			target.isMe = src.isMe;
			target.num = src.num;

			this.print();
		}

		/**
		 * 翻子
		 * @param event 
		 */
		public flop(event) {
			let flop: ACGrid = event.data.flop;
			console.log(`${flop.gridX}_${flop.gridY} 翻到阵营_${flop.isMe ? 0 : 1} ${this.getAnimalName(flop.num)}`);

			flop.isAsk = false;
			this.print();
			this.checkRoundVS();
		}

		/**
		 * 任走一步安全路线，若安全路线无，依然任走一步
		 */
		private moveRandom() {
			let maySafe = [];
			let mayDangerous = [];
			for (let i = 0; i < this.grids.length; i++) {
				let enemy = this.grids[i];
				let condition;
				if (this._camp == 1) {
					condition = !enemy.isMe;
				}
				else {
					condition = enemy.isMe;
				}
				if (condition && !enemy.isAsk && !enemy.isEmpty) {
					let gridDatas = this.selectRoundGrid(enemy);
					for (let j = 0; j < gridDatas.length; j++) {
						if (gridDatas[j].isEmpty) {
							gridDatas[j].num = enemy.num;
							gridDatas[j].isEmpty = false;
							enemy.isEmpty = true;
							//查看是否还有危险；
							if (!this.dangerous(enemy)) {
								maySafe.push({ enemy, grid: gridDatas[j] });
							}
							//数据还原
							gridDatas[j].isEmpty = true;
							enemy.isEmpty = false;
						}
					}
				}

			}

			if (maySafe.length > 0) {
				let sr = Math.floor(maySafe.length * Math.random());
				df.EventBus.instance.emit(ACAlgo.MOVE, { src: maySafe[sr].enemy, target: maySafe[sr].grid });
			}
			else if (mayDangerous.length > 0) {
				// 已无安全路线
				let dr = Math.floor(mayDangerous.length * Math.random());
				df.EventBus.instance.emit(ACAlgo.MOVE, { src: mayDangerous[dr].enemy, target: mayDangerous[dr].grid });
			}
			else {
				console.log("僵局！！！");
			}
		}

		/**
		 * 判断本局胜负
		 * @returns 
		 */
		private checkRoundVS() {
			if (this.hasAsk()) { //有未翻的牌，不判断胜负
				return;
			}
			let enemy = [];
			let me = [];
			for (let i = 0; i < this.grids.length; i++) {
				let chess: ACGrid = this.grids[i];
				if (!chess.isEmpty && !chess.isAsk) {
					if (chess.isMe) {
						me.push(chess);
					}
					else {
						enemy.push(chess);
					}
				}
			}

			let ac: ACRoundVS
			if (enemy.length == 1 && me.length != 0) {
				let w = true;
				let flag = true;
				for (let i = 0; i < me.length; i++) {
					let vsr = this.checkVSR(enemy[0], me[i]);
					if (vsr != ACChessVS.WIN && flag) {
						flag = false;
						w = false;
					}
					if (vsr == ACChessVS.FAIL) {
						ac = ACRoundVS.WIN //对手失败
						break;
					}
					else if (vsr == ACChessVS.TIE) {
						if (me.length == 1) {
							ac = ACRoundVS.TIE;
							break;
						}
						else {
							ac = ACRoundVS.WIN;
							break;
						}
					}
				}
				if (w) {
					ac = ACRoundVS.FAIL;
				}
				if (ac == undefined) {
					ac = ACRoundVS.FAIL; //对手胜利
				}
			}
			else if (me.length == 1 && enemy.length != 0) {
				let w = true;
				let flag = true;
				for (let i = 0; i < enemy.length; i++) {
					let vsr = this.checkVSR(me[0], enemy[i]);
					if (vsr != ACChessVS.WIN && flag) {
						flag = false;
						w = false;
					}

					if (vsr == ACChessVS.FAIL) {
						ac = ACRoundVS.FAIL //我方失败
						break;
					}
					else if (vsr == ACChessVS.TIE) {
						if (enemy.length == 1) {
							ac = ACRoundVS.TIE;
							break;
						}
						else {
							ac = ACRoundVS.FAIL;
							break;
						}
					}
				}
				if (w) {
					ac = ACRoundVS.WIN;
				}
				if (ac == undefined) {
					ac = ACRoundVS.FAIL; //对手胜利
				}
			}
			else if (me.length == 0) {
				ac = ACRoundVS.FAIL;
			}
			else if (enemy.length == 0) {
				ac = ACRoundVS.WIN;
			}

			switch (ac) {
				case ACRoundVS.WIN:
					df.EventBus.instance.emit(ACAlgo.WIN, { win: 0 });
					break;
				case ACRoundVS.FAIL:
					df.EventBus.instance.emit(ACAlgo.WIN, { win: 1 });
					break;
				case ACRoundVS.TIE:
					df.EventBus.instance.emit(ACAlgo.WIN, { win: -1 });
					break;
			}

		}

		/**
		 * 输出结果胜负
		 * @param event event.data.win表胜利方 -1平局
		 */
		public win(event) {
			let win = event.data.win;
			if (win == -1) {
				console.log("---平局---")
			}
			else {
				console.log(`阵营_${win}_获胜`)
			}
		}

		/**
		 * 获得棋子可走方向
		 * @param chess 
		 * @returns 
		 */
		public getMoveDirs(chess: ACGrid) {
			let r: Array<ACGrid> = this.selectRoundGrid(chess);
			let canMove: Array<df.ACGridWay> = [];
			for (let i = 0; i < r.length; i++) {
				if (r[i].isEmpty || (!r[i].isAsk && r[i].isMe != chess.isMe)) { //格子为空或者敌方棋子存在
					let dir = r[i].dir;
					canMove.push(dir);
				}
			}
			return canMove;
		}

		/**
		 * 翻子
		 * @param gridX 
		 * @param gridY 
		 */
		public flopXy(gridX: number, gridY: number) {
			let grid = this.getGrid(gridX, gridY);

			this.flop({ data: { flop: grid } });
		}

		/**
		 * 吃子
		 * @param eating 
		 * @param eated 
		 */
		public eatXy(eating: { gridX: number, gridY: number }, eated: { gridX: number, gridY: number }) {
			let eatingGrid = this.getGrid(eating.gridX, eating.gridY);
			let eatedGrid = this.getGrid(eated.gridX, eated.gridY);

			this.eat({ data: { eating: eatingGrid, eated: eatedGrid } });
		}

		/**
		 * 移动
		 * @param src 
		 * @param target 
		 */
		public moveXy(src: { gridX: number, gridY: number }, target: { gridX: number, gridY: number }) {
			let srcGrid = this.getGrid(src.gridX, src.gridY);
			let targetGrid = this.getGrid(target.gridX, target.gridY);

			this.move({ data: { src: srcGrid, target: targetGrid } });
		}

		/**
		 * 取子
		 * @param gridX 
		 * @param gridY 
		 * @returns 
		 */
		public getGrid(gridX: number, gridY: number): ACGrid {
			for (let i = 0; i < this.grids.length; i++) {
				let grid = this.grids[i];
				if (grid.gridX == gridX && grid.gridY == gridY) {
					return grid;
				}
			}
			return;
		}

	}

	export enum ACGridWay {
		UP,
		DOWN,
		LEFT,
		RIGHT
	}

	/**
	 * 阵营操作--> 吃，跑，翻
	 */
	enum ACCampOpt {
		EAT,
		RUN,
		TIE,
		MOVE,
		FLOP
	}

	/**
	 * 两棋子胜负
	 */
	enum ACChessVS {
		WIN,
		FAIL,
		TIE
	}

	/**
	 * 整局胜负
	 */
	enum ACRoundVS {
		WIN,
		FAIL,
		TIE
	}

}