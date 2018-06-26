document.addEventListener('DOMContentLoaded', function() {
  const AppConst = {
    difficalties: [
    {id: 1, val: "easy"},
    {id: 2, val: "normal"},
    {id: 3, val: "hard"},
    ],
  }
  const template = `
  <div>
    <form @submit.prevent>
      row: <input v-model='row' type='number' min='1' step='1'></input>
      column: <input v-model='column' type='number' min='1' step='1'></input>
      <br/>
      difficalty: <select :value='difficalty'>
        <option v-for='option in resource.difficalties' :value='option.id'>
          {{ option.val }}
        </option>
      </select>
      <button @click='startGame()'>START</button>
    </form>
    <p>row: {{ row }}, column: {{ column }}</p>
    <p>{{ msg }}</p>
    <table class='board-table'>
    <tbody>
    <tr v-for='row in boardRows'>
      <td class='board-cell'
        v-for='col in boardColumns' :row='row' :col='col'
        :ref='row + "-" + col'
        @click='clickCell($event, row, col)'
        @mouseup.right='rightClickCell($event, row, col)'></td>
    </tr>
    </tbody>
    </table>
    </div>
  `;
  new Vue({
    el: "#minesweeper",
    template: template,
    data: {
      resource: {
        difficalties: AppConst.difficalties,
      },
      row: 20,
      column: 20,
      difficalty: AppConst.difficalties[1],
      activeMap: new Map(),
      bombMap: new Map(),
      isGameStart: false,
      msg: "Hello World!",
    },
    computed: {
      boardCells: function () {
        return [...Array(this.column*this.row).keys()];
      },
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
        this.activeMap = new Map();
        this.bombMap = new Map();
        this.displayBombs();
      },
      gameOver: function (row, col) {
        this.displayBombs();
        alert("game over...");
      },
      displayBombs: function () {
      console.log(this.boardRows);
      console.log(this.boardColumns);
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
      openCell: function(row, col) {
        const bombNum = this.checkBombs(row, col);
        if (bombNum === 0) {
          const rowList = this._getSurroundRows(row);
          const colList = this._getSurroundColumns(col);
          for (r of rowList) {
            for (c of colList) {
              if (r === row && c === col) { continue; }
              setTimeout(this.openCell.bind(this, r, c), 1);
            }
          }
        }
      },
      checkBombs: function (row, col) {
        const rowList = this._getSurroundRows(row);
        const colList = this._getSurroundColumns(col);
        let bomNum = 0;
        for (r of rowList) {
          for (c of colList) {
            if (r === row && c === col) { continue; }
            const bomb = this.bombMap.get(this._getCellId(r, c));
            if (bomb) { bomNum++; }
          }
        }
        return bomNum;
      },
      clickCell: function (ev, row, col) {
        if (!this.isGameStart) {
          this.plantBombs(row, col);
          this.isGameStart = true;
        }
        // activation TODO
        if (this.checkActive(row, col)) { return; }
        this.activateCell(row, col);
        if (this.bombMap.get(this._getCellId(row, col))) {
          this.gameOver();
        }
        this.openCell(row, col);

        this.$forceUpdate();
      },
      activateCell: function (row, col) {
        const cellId = this._getCellId(row, col);
        const bombNum = this.checkBombs(row, col);
        const element = this.$refs[cellId][0];
        if (this.bombMap.get(this._getCellId(row, col))) {
          element.style = 'background: red;';
        } else {
          element.innerText = bombNum === 0 ? '' : bombNum;
          this.activeMap.set(cellId, true);
          this.$forceUpdate();
        }
      },
      checkActive: function (row, col) {
        const cellId = this._getCellId(row, col);
        return this.activeMap.get(cellId);
      },
      rightClickCell: function (ev, row, col) {
        if (!this.isGameStart) return;
        console.log(this._getCellId(row,col));
        this.$forceUpdate();
      },
      checkActivation: function (row, col) {
        console.log(row + ":" + col);
        const cellId = this._getCellId(row, col);
        const isActive = this.activeMap.get(cellId);
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
  });

}, false);
