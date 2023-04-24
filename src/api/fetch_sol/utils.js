import contractFuncLocal from "../../broadcast/cInsightScript.s.sol/31337/run-latest.json";
import contractFuncTestnet from "../../broadcast/cInsightDeploy.s.sol/31337/run-latest.json";
import { ethers } from "ethers";
import ChainInsightLogicV1 from "../../abi/LogicV1.sol/ChainInsightLogicV1.json";
import ChainInsightExecutorV1 from "../../abi/ExecutorV1.sol/ChainInsightExecutorV1.json";
import ChainInsightGovernanceProxyV1 from "../../abi/ProxyV1.sol/ChainInsightGovernanceProxyV1.json";
import BonfireProxy from "../../abi/BonfireProxy.sol/Bonfire.json";
import BonfireLogic from "../../abi/BonfireLogic.sol/BonfireLogic.json";
import SkinNft from "../../abi/SkinNft.sol/SkinNft.json";

const msgSender = Number(process.env.REACT_APP_MSG_SENDER);
const LOCAL_FLAG = JSON.parse(process.env.REACT_APP_LOCAL_FLAG.toLowerCase());

// signerを取得
export async function getSigner() {
  if (LOCAL_FLAG) {
    const provider = new ethers.providers.JsonRpcProvider();
    const signer = provider.getSigner(msgSender);
    return signer;
  } else {
    const provider = new ethers.providers.Web3Provider(window.ethereum, 31337);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    return signer;
  }
}

// 現在のアカウントのアドレスを取得
export async function getCurrentAccountAddress() {
  if (LOCAL_FLAG) {
    const provider = new ethers.providers.JsonRpcProvider();
    const accounts = await provider.listAccounts();
    return accounts[msgSender];
  } else {
    const signer = await getSigner();
    const _myaddr = (await signer.getAddress()).toString();
    return _myaddr;
  }
}

// スマコンのアドレスを取得
function getContractAddress(contractName) {
  const contractFunctions = LOCAL_FLAG
    ? contractFuncLocal
    : contractFuncTestnet;
  const contractAddress = contractFunctions.transactions.find(
    (v) => v.contractName === contractName
  ).contractAddress;
  return contractAddress;
}

// 各スマコンのABIを取得
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

// contarctのアドレス，signer，インスタンスを取得
export async function getContract(contractName, abi) {
  if (abi === undefined) abi = getAbi(contractName);
  const contractAddress = getContractAddress(contractName);
  const signer = await getSigner();
  const contract = new ethers.Contract(contractAddress, abi, signer);
  return { contractAddress, signer, contract };
}

/**
 * 文字列を「/」で区切り、前後の空白文字を削除して、配列に変換する関数
 * @param {string | undefined} input 区切りたい文字列
 * @returns {Array} 区切られた文字列を要素に持つ配列
 * e.g.) "x/ y /z" -> ["x", "y", "z"]
 */
export function createArrayFromString(input) {
  if (input === undefined) {
    return [""];
  } else {
    return input.split("/").map((item) => item.trim());
  }
}
