import { Struct, Bool } from 'snarkyjs';

export { Vote };

class Vote extends Struct({
  yes: Bool,
  no: Bool,
}) {
  constructor() {
    super({ yes: Bool(false), no: Bool(false) });
  }

  voteYes() {
    this.yes = Bool(true);
    this.no = Bool(false);
    return this;
  }

  voteNo() {
    this.yes = Bool(false);
    this.no = Bool(true);
    return this;
  }

  validate() {
    let trueCount = 0;
    if (this.yes == Bool(true)) {
      trueCount++;
    }

    if (this.no == Bool(true)) {
      trueCount++;
    }

    if (trueCount == 1) {
      return Bool(true);
    } else {
      return Bool(false);
    }
  }
}
