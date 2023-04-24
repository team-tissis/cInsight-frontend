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
  console.log("contract set");

  const proposalId = await contract.propose(
    targets,
    values,
    signatures,
    calldatas,
    description
  );
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

export async function getProposalMetaInfo(method, proposalId) {
  if (proposalId === undefined) {
    const proposalCount = await getProposalCount();
    var proposalInfos = [];

    for (let i = 0; i < proposalCount; i++) {
      proposalInfos.push(_getProposalMetaInfo(method, proposalId));
      return proposalInfos;
    }
  } else {
    return _getProposalMetaInfo(method, proposalId);
  }
}

/**
 * @returns {any[]}
 */
export async function getProposalContents(method, proposalId) {
  if (proposalId === undefined) {
    const proposalCount = await getProposalCount();
    var proposalInfos = [];

    for (let i = 0; i < proposalCount; i++) {
      proposalInfos.push(_getProposalContents(method, proposalId));
      return proposalInfos;
    }
  } else {
    return _getProposalContents(method, proposalId);
  }
}

async function _getProposalMetaInfo(method, proposalId) {
  const { contract } = await getContract(
    "ChainInsightGovernanceProxyV1",
    proxyExtendedAbi
  );

  if (method == "proposer") {
    const message = await contract.proposals(proposalId);
    return message?.proposer.toString();
  } else if (method == "eta") {
    const message = await contract.proposals(proposalId);
    return message?.eta.toString();
  } else if (method == "startBlock") {
    const message = await contract.proposals(proposalId);
    return message?.startBlock.toString();
  } else if (method == "endBlock") {
    const message = await contract.proposals(proposalId);
    return message?.endBlock.toString();
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

/**
 * @returns {string[]}
 */
async function _getProposalContents(method, proposalId) {
  const { contract } = await getContract(
    "ChainInsightGovernanceProxyV1",
    proxyExtendedAbi
  );
  if (method == "targets") {
    let message = await contract.getTargets(proposalId);
    return message === undefined ? [""] : message;
  } else if (method == "values") {
    let message = await contract.getValues(proposalId);
    if (message !== undefined) {
      message = message.map(ethers.utils.formatEther);
    }
    return message === undefined ? [""] : message;
  } else if (method == "signatures") {
    let message = await contract.getSignatures(proposalId);
    return message === undefined ? [""] : message;
  } else if (method == "calldatas") {
    let message = await contract.getCalldatas(proposalId);
    return message === undefined ? [""] : message;
  }
}

export async function getAccountVotingInfo(method, proposalId) {
  const { contract } = await getContract(
    "ChainInsightGovernanceProxyV1",
    proxyExtendedAbi
  );
  const accountAddress = await getCurrentAccountAddress();

  if (method == "votes") {
    const message = await contract.getVotes(accountAddress);
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
    const proposer = getProposalMetaInfo("proposer", proposalId);
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
