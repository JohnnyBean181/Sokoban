
class Position {
  // x, y stands for the position of the point.
  // r, c stands for the shape of the matrix.
  constructor(x, y, r, c) {
      this.x = x;
      this.y = y;
      this.r = r;
      this.c = c;
  }

  // return ID based on the position.
  getID() {
      return (this.x-1)*this.c + (this.y-1);
  }
}

// both employee and crate share this Class.
export class Object {
  constructor(coords, shape, code) {
      let [x, y]=coords;  // e.g. coords [2, 3]
      let [rows, columns]=shape;  // e.g. shape [8, 8]
      this.curPos = new Position(x, y, rows, columns);  // current position
      this.rows = rows;
      this.columns = columns;
      this.prevPos = null;  // previous position
      this.histPoses = new Array();  // a list of historical positions
      this.code = code; // if it's a crate, then the code is used to identify itself.
  }

  // move to the new position.
  move(x, y) {
      this.histPoses.push(this.curPos);
      this.prevPos = this.curPos;
      this.curPos = new Position(x, y, this.rows, this.columns);
  }

  // move to square with ID
  moveToID(ID) {
      let x = Math.floor(ID/this.columns) + 1;
      let y = ID % this.columns + 1;
      this.move(x, y);
  }

  // stay at the same place.
  stayPut() {
      this.move(this.curPos.x, this.curPos.y);
  }

  // move backwards.
  moveBack() {
      this.prevPos = this.curPos;
      this.curPos = this.histPoses.pop();
  }
}

