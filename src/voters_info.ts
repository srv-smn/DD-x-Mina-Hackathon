import { Poseidon, Field, PublicKey, Bool, Struct } from 'snarkyjs';

export { Voter };

class Voter extends Struct({
  publicKey: PublicKey,
  hasVoted: Bool,
}) {
  constructor(publicKey: PublicKey) {
    super({ publicKey, hasVoted: new Bool(false) });
    this.publicKey = publicKey;
    this.hasVoted = new Bool(false);
  }

  hash(): Field {
    return Poseidon.hash(
      this.publicKey.toFields().concat(this.hasVoted.toField())
    );
  }

  markVoted(): Voter {
    this.hasVoted = new Bool(true);
    return this;
  }
}
