import {
  getContract,
  getAbi,
  getCurrentAccountAddress,
  createArrayFromString,
} from "./utils";
import { fetchConnectedAccountInfo } from "./sbt";
import { ethers } from "ethers";

const functionNames = [
  "initialize",
  "propose",
  "queue",
  "execute",
  "cancel",
  "veto",
  "getReceipt",
  "state",
  "castVote",
  "castVoteWithReason",
  "castVoteBySig",
  "_setExecutingGracePeriod",
  "_setExecutingDelay",
  "_setVotingDelay",
  "_setVotingPeriod",
  "_setProposalThreshold",
  "_setPendingVetoer",
  "_acceptVetoer",
  "_burnVetoPower",
  "getHasVoted",
  "getSupport",
  "getVotes",
  "getProposer",
  "getTargets",
  "getValues",
  "getSignatures",
  "getCalldatas",
  "getForVotes",
  "getAgainstVotes",
  "getAbstainVotes",
];

const proxyExtendedAbi = getProxyAbiAddedLogic(functionNames);

function getProxyAbiAddedLogic(_functionNames) {
  const abi = getAbi("ChainInsightGovernanceProxyV1");
  const abiLogic = getAbi("ChainInsightLogicV1");
  for (var i = 0; i < _functionNames.length; i++) {
    abi.push(abiLogic.find((v) => v.name === _functionNames[i]));
  }
  return abi;
}

export async function propose(
  targets,
  values,
  signatures,
  datas,
  datatypes,
  description
) {
  const { contract } = await getContract(
    "ChainInsightGovernanceProxyV1",
    proxyExtendedAbi
  );
  console.log("propose start ...");

  targets = createArrayFromString(targets);
  values = createArrayFromString(values);
  values = values.map(ethers.utils.parseEther); // ETH -> Wei
  signatures = createArrayFromString(signatures);
  datas = createArrayFromString(datas);
  datatypes = createArrayFromString(datatypes);

  console.log("targets, values, signatures, datas, datatypes, description");
  console.log(targets, values, signatures, datas, datatypes, description);

  const abiCoder = ethers.utils.defaultAbiCoder;
  const calldatas = [];
  for (var i = 0; i < datas.length; i++) {
    calldatas.push(abiCoder.encode([datatypes[i]], [datas[i]]));
  }
  console.log(calldatas);
  // const calldatas = abiCoder.encode([datatypes], [datas]);
  console.log("contract set");

  const proposalId = await contract.propose(
    targets,
    values, // [ethers.utils.parseEther(String(values))],
    signatures,
    calldatas,
    description
  );
  console.log("propose end ...");
  console.log("proposeResponse:");
  console.log(proposalId);
  return proposalId;
}

export async function vote(proposalId, voteResult, reason) {
  const { contract } = await getContract(
    "ChainInsightGovernanceProxyV1",
    proxyExtendedAbi
  );
  let support;
  if (voteResult == "against") {
    support = 0;
  } else if (voteResult == "for") {
    support = 1;
  } else if (voteResult == "abstention") {
    support = 2;
  }
  await contract.castVoteWithReason(proposalId, support, reason);
}

export async function queue(proposalId) {
  const { contract } = await getContract(
    "ChainInsightGovernanceProxyV1",
    proxyExtendedAbi
  );
  await contract.queue(proposalId);
}

export async function execute(proposalId) {
  const { contract } = await getContract(
    "ChainInsightGovernanceProxyV1",
    proxyExtendedAbi
  );
  await contract.execute(proposalId);
}

export async function cancel(proposalId) {
  const { contract } = await getContract(
    "ChainInsightGovernanceProxyV1",
    proxyExtendedAbi
  );
  await contract.cancel(proposalId);
}

export async function veto(proposalId) {
  const { contract } = await getContract(
    "ChainInsightGovernanceProxyV1",
    proxyExtendedAbi
  );
  await contract.veto(proposalId);
}

export async function getState(proposalId) {
  const { contract } = await getContract(
    "ChainInsightGovernanceProxyV1",
    proxyExtendedAbi
  );
  const message = await contract.state(proposalId);
  console.log(message);
  if (message == 0) {
    return "Pending";
  } else if (message == 1) {
    return "Active";
  } else if (message == 2) {
    return "Canceled";
  } else if (message == 3) {
    return "Defeated";
  } else if (message == 4) {
    return "Succeeded";
  } else if (message == 5) {
    return "Queued";
  } else if (message == 6) {
    return "Expired";
  } else if (message == 7) {
    return "Executed";
  } else if (message == 8) {
    return "Vetoed";
  } else {
    return undefined;
  }
}
// if (message == 0) {
//   return "Pending";
// } else if (message == 1) {
//   return "Active";
// } else if (message == 2) {
//   return "Canceled";
// } else if (message == 3) {
//   return "Defeated";
// } else if (message == 4) {
//   return "Succeeded";
// } else if (message == 5) {
//   return "Queued";
// } else if (message == 6) {
//   return "Expired";
// } else if (message == 7) {
//   return "Executed";
// } else if (message == 8) {
//   return "Vetoed";
//   return message;
// }

export async function getProposalInfo(method, proposalId) {
  if (proposalId == undefined) {
    const proposalCount = await getProposalCount();
    var proposalInfos = [];

    for (let i = 0; i < proposalCount; i++) {
      proposalInfos.push(_getProposalInfo(method, proposalId));
      return proposalInfos;
    }
  } else {
    return _getProposalInfo(method, proposalId);
  }
}

export async function _getProposalInfo(method, proposalId) {
  const { contract } = await getContract(
    "ChainInsightGovernanceProxyV1",
    proxyExtendedAbi
  );
  console.log("getProposalInfo...");
  console.log("Current contract is ", contract);
  const message = await contract.proposals(proposalId);
  console.log("done...!");

  if (method == "proposer") {
    return message?.proposer.toString();
  } else if (method == "eta") {
    return message?.eta.toString();
  } else if (method == "targets") {
    const message = await contract.getTargets(proposalId);
    return message?.toString();
  } else if (method == "values") {
    const message = await contract.getValues(proposalId);
    return message?.toString();
  } else if (method == "signatures") {
    const message = await contract.getSignatures(proposalId);
    return message?.toString();
  } else if (method == "calldatas") {
    const message = await contract.getCalldatas(proposalId);
    return message?.toString();
  } else if (method == "startBlock") {
    return message?.startBlock.toString();
  } else if (method == "endBlock") {
    return message?.startBlock.toString();
  } else if (method == "forVotes") {
    const message = await contract.getForVotes(proposalId);
    return message?.toString();
  } else if (method == "againstVotes") {
    const message = await contract.getAgainstVotes(proposalId);
    return message?.toString();
  } else if (method == "abstainVotes") {
    const message = await contract.getAbstainVotes(proposalId);
    return message?.toString();
  }
}

export async function getAccountVotingInfo(method, proposalId) {
  const { contract } = await getContract(
    "ChainInsightGovernanceProxyV1",
    proxyExtendedAbi
  );
  const accountAddress = await getCurrentAccountAddress();

  if (method == "votes") {
    console.log("start");
    const message = await contract.getVotes(accountAddress);
    console.log("end");
    return message?.toString();
  }

  const message = await contract.getReceipt(proposalId, accountAddress);
  const grade = await fetchConnectedAccountInfo("gradeOf");
  const hasVoted = message?.hasVoted;

  if (method == "canVote") {
    return grade >= 1;
  } else if (method == "hasVoted") {
    if (grade == 0) {
      return "投票不可能";
    } else if (hasVoted) {
      return "投票済";
    } else {
      return "未投票";
    }
  } else if (method == "support") {
    if (!hasVoted) {
      return "-";
    } else if (message?.support == 0) {
      return "反対";
    } else if (message?.support == 1) {
      return "賛成";
    } else if (message?.support == 2) {
      return "棄権";
    }
    // } else if (method == "votes") {
    //   return message?.votes.toString();
  } else if (method == "canCancel") {
    console.log(grade >= 1);
    const proposer = getProposalInfo("proposer", proposalId);
    return proposer == accountAddress;
  }
}

// export async function getExecutingGracePeriod() {
//   const message = await contract.executingGracePeriod();
//   console.log(message);
//   return message?.toString();
// }
//
// export async function getExecutingDelay() {
//   const message = await contract.executingDelay();
//   console.log(message?.toString());
//   return message?.toString();
// }
//
// export async function getVotingPeriod() {
//   const message = await contract.votingPeriod();
//   console.log(message?.toString());
//   return message?.toString();
// }
//
// export async function getVotingDelay() {
//   const message = await contract.votingDelay();
//   console.log(message?.toString());
//   return message?.toString();
// }
//
// export async function getProposalThreshold() {
//   const message = await contract.proposalThreshold();
//   console.log(message?.toString());
//   return message?.toString();
// }
//
// export async function getLatestProposalId(address) {
//   const message = await contract.latestProposalIds(address);
//   console.log(message?.toString());
//   return message?.toString();
// }

export async function getProposalCount() {
  const { contract } = await getContract(
    "ChainInsightGovernanceProxyV1",
    proxyExtendedAbi
  );
  const message = await contract.proposalCount();
  console.log("proposalCount done...");
  console.log(message?.toString());
  return message?.toString();
}
