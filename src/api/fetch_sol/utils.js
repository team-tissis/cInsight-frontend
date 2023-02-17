import { ethers } from "ethers";
import ChainInsightLogicV1 from "../../abi/LogicV1.sol/ChainInsightLogicV1.json";
import ChainInsightExecutorV1 from "../../abi/ExecutorV1.sol/ChainInsightExecutorV1.json";
import ChainInsightGovernanceProxyV1 from "../../abi/ProxyV1.sol/ChainInsightGovernanceProxyV1.json";
import BonfireProxy from "../../abi/BonfireProxy.sol/Bonfire.json";
import BonfireLogic from "../../abi/BonfireLogic.sol/BonfireLogic.json";
import SkinNft from "../../abi/SkinNft.sol/SkinNft.json";

// スマコンのアドレスを取得
function getContractAddress(contractName) {
  const contractAddress = contractFunctions.transactions.find(
    (v) => v.contractName === contractName
  ).contractAddress;
  return contractAddress;
}

export function getAbi(contractName) {
  if (contractName === "ChainInsightLogicV1") return ChainInsightLogicV1.abi;
  else if (contractName === "ChainInsightExecutorV1")
    return ChainInsightExecutorV1.abi;
  else if (contractName === "ChainInsightGovernanceProxyV1")
    return ChainInsightGovernanceProxyV1.abi;
  else if (contractName === "Bonfire") return BonfireProxy.abi;
  else if (contractName === "BonfireLogic") return BonfireLogic.abi;
  else if (contractName === "SkinNft") return SkinNft.abi;
}

// (0) 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 (10000 ETH)
// (1) 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 (10000 ETH)
// (2) 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc (10000 ETH)
// (3) 0x90f79bf6eb2c4f870365e785982e1f101e93b906 (10000 ETH)
// (4) 0x15d34aaf54267db7d7c367839aaf71a00a2c6a65 (10000 ETH)
// (5) 0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc (10000 ETH)
// (6) 0x976ea74026e726554db657fa54763abd0c3a0aa9 (10000 ETH)
// (7) 0x14dc79964da2c08b23698b3d3cc7ca32193d9955 (10000 ETH)
// (8) 0x23618e81e3f5cdf7f54c3d65f7fbc0abf5b21e8f (10000 ETH)
// (9) 0xa0ee7a142d267c1f36714e4a8f75612f20a79720 (10000 ETH)

const msgSender = 2; // 0x70997970c51812dc3a010c7d01b50e0d17dc79c8

// ローカルネットワークにアクセスする方法（ http://localhost:8545 が指定される）
import contractFunctions from "../../broadcast/cInsightScript.s.sol/31337/run-latest.json";
export async function getSigner() {
  const provider = new ethers.providers.JsonRpcProvider();
  const signer = provider.getSigner(msgSender); // 2番目の account（1番目は deployer）

  return signer;
}
//
export async function getCurrentAccountAddress() {
  const provider = new ethers.providers.JsonRpcProvider();
  const accounts = await provider.listAccounts();
  return accounts[msgSender];
}

// MetaMask を使う方法
// import contractFunctions from "../../broadcast_testnet/run-latest.json";
// export async function getSigner() {
//   const provider = new ethers.providers.Web3Provider(window.ethereum, 80001);
//   await provider.send('eth_requestAccounts', []);
//   const signer = provider.getSigner();

//   return signer;
// }

// export async function getCurrentAccountAddress() {
//   const signer = await getSigner();
//   const _myaddr = (await signer.getAddress()).toString();
//   console.log({ wallet: _myaddr });
//   return _myaddr;
// }

export async function getContract(contractName, abi) {
  if (abi === undefined) abi = getAbi(contractName);
  const contractAddress = getContractAddress(contractName);
  const signer = await getSigner();
  const contract = new ethers.Contract(contractAddress, abi, signer);
  return { contractAddress, signer, contract };
}
