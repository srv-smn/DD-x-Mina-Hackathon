import { Field, Struct } from 'snarkyjs';

export { VoteResult };

class VoteResult extends Struct({
  yes: Field,
  no: Field,
  root: Field,
}) {
  constructor(root: Field) {
    super({ yes: Field(0), no: Field(0), root });
    this.root = root;
    this.no = Field(0);
    this.yes = Field(0);
  }

  voteYes() {
    this.yes = this.yes.add(1);
    return this;
  }

  voteNo() {
    this.no = this.no.add(1);
    return this;
  }

  setRoot(_root: Field) {
    this.root = _root;
    return this;
  }
}
