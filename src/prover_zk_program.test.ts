import { Field, MerkleTree, Mina, PrivateKey } from 'snarkyjs';

import { MyMerkleWitness, RecursiveVoting } from './prover_zk_program.js';
import { VoteResult } from './vote_result.js';
import { Vote } from './vote.js';
import { Voter } from './voters_info.js';
import { Attestation, VotingProof } from './voting_zk_app.js';

describe('Add', () => {
  it('Test ZK Program', async () => {
    let doProofs = true;
    type Names = 'Bob' | 'Alice' | 'Charlie' | 'Olivia';
    let Local = Mina.LocalBlockchain({ proofsEnabled: doProofs });
    Mina.setActiveInstance(Local);
    let initialBalance = 10_000_000_000;

    let feePayerKey = Local.testAccounts[0].privateKey;
    let feePayer = Local.testAccounts[0].publicKey;

    // the zkapp account
    let zkappKey = PrivateKey.random();
    let zkappAddress = zkappKey.toPublicKey();

    const Tree = new MerkleTree(8);

    let Bob = new Voter(Local.testAccounts[0].publicKey);
    let Alice = new Voter(Local.testAccounts[1].publicKey);
    let Charlie = new Voter(Local.testAccounts[2].publicKey);
    let Olivia = new Voter(Local.testAccounts[3].publicKey);

    Tree.setLeaf(0n, Bob.hash());
    Tree.setLeaf(1n, Alice.hash());
    Tree.setLeaf(2n, Charlie.hash());
    Tree.setLeaf(3n, Olivia.hash());

    let initialCommitment = Tree.getRoot();

    let AttestationZkApp = new Attestation(zkappAddress);
    if (doProofs) {
      await RecursiveVoting.compile();
      await Attestation.compile();
    }

    // init
    const initVoteResult = new VoteResult(initialCommitment);

    let initProof = await RecursiveVoting.init(initVoteResult);

    // vote by BOB
    let vote: Vote = new Vote();
    vote = vote.voteYes();
    let voteResult: VoteResult = VoteResultHelper(
      initProof.publicInput.root,
      initProof.publicInput.yes,
      initProof.publicInput.no
    );
    voteResult.voteYes();

    let w = Tree.getWitness(0n);
    let witness = new MyMerkleWitness(w);

    Bob = Bob.markVoted();
    Tree.setLeaf(0n, Bob.hash());

    initialCommitment = Tree.getRoot();

    let voteProof = await RecursiveVoting.vote(
      voteResult,
      initProof,
      Local.testAccounts[0].privateKey,
      vote,
      witness,
      initialCommitment
    );

    // vote by ALICE
    vote = new Vote();
    vote = vote.voteYes();

    voteResult = VoteResultHelper(
      initialCommitment,
      voteProof.publicInput.yes,
      voteProof.publicInput.no
    );

    voteResult.voteYes();

    w = Tree.getWitness(1n);

    witness = new MyMerkleWitness(w);

    Alice = Alice.markVoted();

    Tree.setLeaf(1n, Alice.hash());

    initialCommitment = Tree.getRoot();

    voteProof = await RecursiveVoting.vote(
      voteResult,
      voteProof,
      Local.testAccounts[1].privateKey,
      vote,
      witness,
      initialCommitment
    );

    // vote by Charlie
    vote = new Vote();
    vote = vote.voteNo();

    voteResult = VoteResultHelper(
      initialCommitment,
      voteProof.publicInput.yes,
      voteProof.publicInput.no
    );

    voteResult.voteNo();

    w = Tree.getWitness(2n);

    witness = new MyMerkleWitness(w);

    Charlie = Charlie.markVoted();

    Tree.setLeaf(2n, Charlie.hash());

    initialCommitment = Tree.getRoot();

    voteProof = await RecursiveVoting.vote(
      voteResult,
      voteProof,
      Local.testAccounts[2].privateKey,
      vote,
      witness,
      initialCommitment
    );

    // vote by Olivia
    vote = new Vote();
    vote = vote.voteYes();

    voteResult = VoteResultHelper(
      initialCommitment,
      voteProof.publicInput.yes,
      voteProof.publicInput.no
    );

    voteResult.voteYes();

    w = Tree.getWitness(3n);

    witness = new MyMerkleWitness(w);

    Olivia = Olivia.markVoted();

    Tree.setLeaf(3n, Olivia.hash());

    initialCommitment = Tree.getRoot();

    voteProof = await RecursiveVoting.vote(
      voteResult,
      voteProof,
      Local.testAccounts[3].privateKey,
      vote,
      witness,
      initialCommitment
    );

    RecursiveVoting.verify(voteProof);
    voteProof.publicInput.no.assertEquals(Field(1));
    voteProof.publicInput.yes.assertEquals(Field(3));
  });

  const VoteResultHelper = (root: Field, yes: Field, no: Field) => {
    let voteResult: VoteResult = new VoteResult(root);

    for (let i = Field(0); i < yes; i = i.add(1)) {
      voteResult = voteResult.voteYes();
    }

    for (let i = Field(0); i < no; i = i.add(1)) {
      voteResult = voteResult.voteNo();
    }

    return voteResult;
  };
});
