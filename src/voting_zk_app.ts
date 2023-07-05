import {
  Experimental,
  Field,
  method,
  Proof,
  SmartContract,
  State,
  state,
} from 'snarkyjs';

import { MyMerkleWitness, RecursiveVoting } from './prover_zk_program.js';
import { VoteResult } from './vote_result.js';

export { Attestation, VotingProof };

// class VotingProof extends Proof<VoteResult, VoteResult> {
//   static publicInputType = VoteResult;
//   static tag = () => RecursiveVoting;
// }

class VotingProof extends Experimental.ZkProgram.Proof(RecursiveVoting) {}

class Attestation extends SmartContract {
  @state(Field) yes = State<Field>();
  @state(Field) no = State<Field>();
  @state(Field) documentID = State<Field>();

  @method init() {
    super.init();
    this.yes.set(Field(0));
    this.no.set(Field(0));
    // add your document ID here
    this.documentID.set(Field(0));
  }

  @method verifyAndPublish(proof: VotingProof) {
    proof.verify();
    this.yes.set(proof.publicInput.yes);
    this.no.set(proof.publicInput.no);
  }
}
