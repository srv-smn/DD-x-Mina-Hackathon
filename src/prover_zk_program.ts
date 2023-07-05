import {
  Field,
  Experimental,
  SelfProof,
  PrivateKey,
  MerkleWitness,
  Provable,
} from 'snarkyjs';

import { Voter } from './voters_info.js';
import { VoteResult } from './vote_result.js';
import { Vote } from './vote.js';

export { MyMerkleWitness, RecursiveVoting };

// @note can change length
class MyMerkleWitness extends MerkleWitness(8) {}
// in this program the sequence of voting does not matter
// @note : Need to declare merkle root of the tree

const RecursiveVoting = Experimental.ZkProgram({
  publicInput: VoteResult,

  methods: {
    init: {
      //  privateInputs: [Field],
      privateInputs: [],

      method(publicInput: VoteResult) {
        publicInput.yes.assertEquals(Field(0));
        publicInput.no.assertEquals(Field(0));
      },
    },

    vote: {
      privateInputs: [SelfProof, PrivateKey, Vote, MyMerkleWitness, Field],

      method(
        publicInput: VoteResult,
        previousProof: SelfProof<VoteResult, VoteResult>,
        user: PrivateKey,
        vote: Vote,
        witness: MyMerkleWitness,
        newRoot: Field
      ) {
        // verify the previous proof
        previousProof.verify();

        // create new voter
        const pubAddress = user.toPublicKey();
        let voter = new Voter(pubAddress);

        // check the witness has the voter's info and it has not voted yet
        witness.calculateRoot(voter.hash()).assertEquals(publicInput.root);

        // check the new root should be constructed from the given witness
        voter = voter.markVoted();
        const _newRoot = witness.calculateRoot(voter.hash());
        newRoot.assertEquals(_newRoot);
        publicInput.setRoot(_newRoot);

        // check if vote object is correct or not
        vote.validate().assertTrue;

        let v1 = Provable.if(
          vote.yes,
          previousProof.publicInput.no,
          previousProof.publicInput.yes
        );
        let v2 = Provable.if(vote.yes, publicInput.no, publicInput.yes);
        v1.assertEquals(v2);

        v1 = Provable.if(
          vote.yes,
          previousProof.publicInput.yes.add(1),
          previousProof.publicInput.no.add(1)
        );
        v2 = Provable.if(vote.yes, publicInput.yes, publicInput.no);
        v1.assertEquals(v2);

        // if (vote.yes) {
        //   previousProof.publicInput.no.assertEquals(publicInput.no);
        //   previousProof.publicInput.yes.add(1).assertEquals(publicInput.yes);
        // } else {
        //   previousProof.publicInput.yes.assertEquals(publicInput.yes);
        //   previousProof.publicInput.no.add(1).assertEquals(publicInput.no);
        // }
      },
    },
  },
});
