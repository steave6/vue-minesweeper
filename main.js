function main () {
  const template = `
<div>
  <h>hello world</h>
  <table class='board-table'>
  <tbody>
    <tr v-for='row in boardRows'>
      <td class='board-cell'
        v-for='col in boardColumns' :row='row' :col='col'
        :ref='""+ row + "-" + col'
        :class='[{active: checkActivation(row, col)}]'
        @click='clickCell($event, row, col)'
        @mouseup.right='rightClickCell($event, row, col)'></td>
    </tr>
  </tbody>
  </table>
</div>
  `

  new Vue({
    el: '#minesweeper',
    template: template,
    data: {
      column: 10,
      row: 20,
      activeMap: new Map(),
      bombMap: new Map(),
      isGameStart: false,
    },
    computed: {
      boardCells: function () {
        return [...Array(this.column*this.row).keys()];
      },
      boardColumns: function () {
        return [...Array(this.column).keys()];
      },
      boardRows: function () {
        return [...Array(this.row).keys()];
      },
    },
    methods: {
      startGame: function () {
      },
      gameOver: function (row, col) {
        this.displayBombs();
        alert("game over...");
      },
      displayBombs: function () {
        for (r of this.boardRows) {
          for (c of this.boardColumns) {
            const cellId = this._getCellId(r, c);
            if (this.bombMap.get(cellId)) {
              this.$refs[cellId][0].style = 'background: red;';
            }
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
        if (this.checkActive(row, col)) { return; }
        this.activateCell(row, col);
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
        if (this.bombMap.get(this._getCellId(row, col))) {
          this.gameOver();
          return;
        }
        this.openCell(row, col);

        this.$forceUpdate();
      },
      activateCell: function (row, col) {
        const cellId = this._getCellId(row, col);
        const bombNum = this.checkBombs(row, col);
        this.$refs[cellId][0].innerText = bombNum === 0 ? '' : bombNum;
        this.activeMap.set(cellId, true);
        this.$forceUpdate();
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
    mounted: function () {
      this.startGame();
    },
  })
}

document.addEventListener("DOMContentLoaded", function(event) {
  main();
});
