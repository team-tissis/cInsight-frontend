import { ethers } from "ethers";
import { getContract, getAbi, getCurrentAccountAddress } from "./utils";

function getSbtAbiAddedImp(_functionNames) {
  const abi = getAbi("Bonfire");
  const abiImp = getAbi("BonfireLogic");
  for (var i = 0; i < _functionNames.length; i++) {
    abi.push(abiImp.find((v) => v.name === _functionNames[i]));
  }
  return abi;
}

const functionNames = [
  "mint",
  "mintWithReferral",
  "burn",
  "monthInit",
  "addFavos",
  "refer",
];
const sbtAbi = getSbtAbiAddedImp(functionNames);

export async function fetchConnectedAccountInfo(method, account) {
  const { contract } = await getContract("Bonfire", sbtAbi);
  if (account === undefined) {
    account = await getCurrentAccountAddress();
  }
  const response = await fetchFunction(contract, account, method);
  console.log({
    address: account,
    method: method,
    value: response.toString(),
  });
  return response.toString();
}

async function fetchFunction(contract, address, method) {
  let response;
  if (method == "favoOf") {
    response = contract.favoOf(address);
  } else if (method == "makiOf") {
    response = contract.makiOf(address);
  } else if (method == "gradeOf") {
    response = contract.gradeOf(address);
  } else if (method == "makiMemoryOf") {
    response = contract.makiMemoryOf(address);
  } else if (method == "referralOf") {
    response = contract.referralOf(address);
  } else if (method == "tokenIdOf") {
    response = contract.tokenIdOf(address);
  } else if (method == "tokenURI") {
    response = contract.tokenURI(contract.tokenIdOf(address));
  } else {
    console.error("Method Not Found");
    response = "none";
  }
  return response;
}

export async function fetchAccountImageUrl(address) {
  const { contract } = await getContract("Bonfire", sbtAbi);
  let response;

  if (address === undefined) {
    const myAddr = await getCurrentAccountAddress();
    response = await fetchFunction(contract, myAddr, "tokenURI");
  } else {
    response = await fetchFunction(contract, address, "tokenURI");
  }
  // image uriを取る処理
  var result;
  var request = new XMLHttpRequest();
  request.open("GET", response, false);
  request.send(null);
  result = JSON.parse(request.responseText).image;
  return result;
}

export async function fetchReferralRate() {
  const { contract } = await getContract("Bonfire");
  const message = await contract.referralRate();
  console.log({ referralRate: message });
  return message;
}

export async function fetchConnectedAccountReferralNum(account) {
  const referralRate = await fetchReferralRate();
  if (account === undefined) {
    account = await getCurrentAccountAddress();
  }
  const grade = await fetchConnectedAccountInfo("gradeOf", account);
  return referralRate[grade];
}

export async function fetchMonthlyDistributedFavoNum() {
  const { contract } = await getContract("Bonfire");
  const message = await contract.monthlyDistributedFavoNum();
  console.log({ monthlyDistributedFavoNum: message.toString() });
  return message.toString();
}

export async function fetchMintedTokenNumber() {
  const { contract } = await getContract("Bonfire");
  const message = await contract.mintedTokenNumber();
  console.log({ mintedTokenNumber: message.toString() });
  return message.toString();
}

const ETH_AMOUNT = "0.2"
export async function mint(address) {
  try {
    let mintIndex;
    if (address === undefined) {
      // mint
      const { contract } = await getContract("Bonfire");
      const options = { value: ethers.utils.parseEther(ETH_AMOUNT) };
      mintIndex = await contract.mint(options);
    } else {
      // mint with referral
      const { contract } = await getContract("Bonfire", sbtAbi);
      const options = { value: ethers.utils.parseEther(ETH_AMOUNT) };
      mintIndex = await contract.mintWithReferral(address, options);
    }
    console.log({ mintIndex });
    return {status: true, message: "SBTトークンを発行しました"};
  } catch (e) {
    console.log({ mint_error: e });
    if (e?.reason == "execution reverted: Need to send more ETH.") {
      return {status: false, message: "送金するETHが少なすぎます\n送金額を増やしてください"};
    } else if (e?.reason == "network does not support ENS") {
      return {status: false, message: "無効な紹介者アドレスです。\n再度アドレスを確認してください"};
    } else {
      return {status: false, message: "何かしらのエラーにより、sbtトークンの発行に失敗しました"};
    }
  }
  //TODO; minted listen
}

export async function refer(address) {
  const { contract } = await getContract("Bonfire");
  contract.refer(address);

  //TODO; refer listen
}

export async function _addFavos(address, num) {
  const { contract } = await getContract("Bonfire", sbtAbi);
  console.log(address);
  contract.addFavos(address, num);
}

export async function addFavos(address, num) {
  console.log({ addFavos: address });
  try {
    _addFavos(address, num);
  } catch (e) {
    console.log(e);
  }
}
