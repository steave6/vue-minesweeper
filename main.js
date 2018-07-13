document.addEventListener('DOMContentLoaded', function() {
  const AppConst = {
    difficulties: [
    {id: 1, val: "easy"},
    {id: 2, val: "normal"},
    {id: 3, val: "hard"},
    ],
  }
  const template = `
<div class="mine-template" :style="'--mine-row:' + row*20 + 'px; --mine-column:' + column*20 +'px;'">
  <div class='row'>
    <form id='mine-setting container' @submit.prevent>
      <div class='input-field inline col s4'>
        <input id='row' class='validate' v-model='row' type='number' min='1' step='1'/>
        <label for='row' class="active">row</label>
      </div>
      <div class='input-field inline col s4'>
        <input id='column' class='validate' v-model='column' type='number' min='1' step='1' placeholder='column'/>
        <label for='column' class="active">column</label>
      </div>
      <div class='input-field col s4'>
        <select id='mine-difficulty'>
          <option v-for='option in resource.difficulties' :value='option.id'>
            {{ option.val }}
          </option>
        </select>
        <label for="mine-difficulty" class='active'>difficulty: </label>
      </div>
      <button class='btn lime-green col s2 center' @click='startGame()'>START</button>
    </form>
    <table class='board-table container' oncontextmenu="return false;">
      <tbody>
        <tr v-for='row in boardRows'>
          <td class='board-cell'
            v-for='col in boardColumns' :row='row' :col='col'
            :ref='row + "-" + col'
            @click='clickCell($event, row, col)'
            @mouseup.right='rightClickCell($event, row, col)'>
            <p></p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
  `;
  new Vue({
    el: "#minesweeper",
    template: template,
    data: {
      resource: {
        difficulties: AppConst.difficulties,
      },
      row: 10,
      column: 10,
      difficalty: AppConst.difficulties[1],
      bombMap: new Map(),
      openCellQueue: [],
      isGameStart: false,
    },
    computed: {
      boardColumns: function () {
        const col = this.column;
        console.log(`typeof: ${typeof col}`);
        return [...Array(col).keys()];
      },
      boardRows: function () {
        return [...Array(this.row).keys()];
      },
    },
    watch: {
      row: function (val) {
        this.row = +(val);
      },
      column: function (val) {
        this.column = +(val);
      },
    },
    filters: {
    },
    methods: {
      startGame: function () {
        this.isGameStart = false;
        this.bombMap = new Map();
        this.clearBoard();
      },
      gameOver: function (row, col) {
        this.displayBombs();
        alert("game over...");
      },
      clearBoard: function () {
        for (r of this.boardRows) {
          for (c of this.boardColumns) {
            const cellId = this._getCellId(r, c);
            const element = this.$refs[cellId][0]
            element.classList.remove('active');
            element.classList.remove('red');
            element.replaceChild(document.createElement('p'), element.firstChild);
          }
        }
      },
      displayBombs: function () {
        for (r of this.boardRows) {
          for (c of this.boardColumns) {
            setTimeout(this.activateCell.bind(this, r, c), 1);
          }
        }
      },
      plantBombs: function (row, col) {
        const rows = this.boardRows;
        const columns = this.boardColumns;
        for (r of rows) {
          for (c of columns) {
            if (Math.random() < 0.25) {
              this.bombMap.set(this._getCellId(r, c), true);
            } else {
              this.bombMap.set(this._getCellId(r, c), false);
            }
          }
        }
        const rowList = this._getSurroundRows(row);
        const colList = this._getSurroundColumns(col);
        for (r of rowList) {
          for (c of colList) {
            this.bombMap.set(this._getCellId(r, c), false);
          }
        }
      },
      openAdjacentCell: function(row, col) {
        const bombNum = this.checkBombs(row, col);
        if (bombNum === 0) {
          const rowList = this._getSurroundRows(row);
          const colList = this._getSurroundColumns(col);
          for (r of rowList) {
            for (c of colList) {
              if (r === row && c === col) { continue; }
              // setTimeout(this.openAdjacentCell.bind(this, r, c), 1);
              this.openCellQueue.push({row: r, col: c});
            }
          }
          this.processOpenQueue()
        }
      },
      processOpenQueue () {
        let que = this.openCellQueue.pop();
        while (que) {
          this.clickCell(null, que.row, que.col);
          que = this.openCellQueue.pop();
        }
      },
      clickCell: function (ev, row, col) {
        if (!this.isGameStart) {
          this.plantBombs(row, col);
          this.isGameStart = true;
        }
        // flag return
        const element = this.$refs[this._getCellId(row, col)][0];
        if (this._getINodes(element)) {
          return;
        }
        // activation
        if (this.checkActive(row, col)) { return; }
        this.activateCell(row, col);
        if (this.bombMap.get(this._getCellId(row, col))) {
          this.gameOver();
          return;
        }
        this.openAdjacentCell(row, col);
      },
      checkBombs: function (row, col) {
        const rowList = this._getSurroundRows(row);
        const colList = this._getSurroundColumns(col);
        let bomNum = 0;
        for (r of rowList) {
          for (c of colList) {
            // if (r === row && c === col) { continue; }
            const bomb = this.bombMap.get(this._getCellId(r, c));
            if (bomb) { bomNum++; }
          }
        }
        return bomNum;
      },
      activateCell: function (row, col) {
        const cellId = this._getCellId(row, col);
        const bombNum = this.checkBombs(row, col);
        const element = this.$refs[cellId][0];
        element.classList.add('active');
        if (this.bombMap.get(this._getCellId(row, col))) {
          element.classList.add('red');
        } else {
          const p = document.createElement("p");
          p.innerText = bombNum === 0 ? '' : bombNum;
          element.replaceChild(p, element.firstChild);
        }
      },
      checkActive: function (row, col) {
        const cellId = this._getCellId(row, col);
        return this.$refs[cellId][0].classList.contains('active');
      },
      rightClickCell: function (ev, row, col) {
        if (!this.isGameStart) return;
        const cellId = this._getCellId(row, col);
        const element = this.$refs[cellId][0];
        const inode = this._getINodes(element);
        if (inode) {
          element.removeChild(inode);
        } else {
          const inode = document.createElement('i');
          inode.classList.add('material-icons');
          inode.classList.add('md-10');
          inode.innerText = 'flag';
          element.appendChild(inode);
        }
      },
      _getINodes(node) {
        if (!node) return null;
        let nodes = [ ...node.childNodes ];
        for (n of nodes) {
          if (n.tagName === "I") {
            return n
          }
        }
        return;
      },
      checkActivation: function (row, col) {
        console.log(row + ":" + col);
        const cellId = this._getCellId(row, col);
        const isActive = this.$refs[cellId][0].classList.contains('active');
        return !!isActive;
      },
      _getSurroundRows: function (row) {
        return [row-1, row, row+1].filter(i => i >= 0).filter(i => i < this.row);
      },
      _getSurroundColumns: function (col) {
        return [col-1, col, col+1].filter(i => i >= 0).filter(i => i < this.column);
      },
      _getCellId: function (row, col) {
        return `${row}-${col}`;
      },
    },
    mounted: function () {
      const elems = document.querySelectorAll('select');
      const instances = M.FormSelect.init(elems, {});
    },
  });

}, false);
