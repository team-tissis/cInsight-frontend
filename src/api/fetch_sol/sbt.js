import { ethers } from "ethers";
import {
  getContract,
  getAbi,
  getCurrentAccountAddress,
  getProvider,
} from "./utils";

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
  "addFavosFromMultipleUsers",
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

export async function mint(address) {
  try {
    let mintIndex;
    if (address === undefined) {
      // mint
      const { contract } = await getContract("Bonfire");
      const options = { value: ethers.utils.parseEther("0.2") };
      mintIndex = await contract.mint(options);
    } else {
      // mint with referral
      const { contract } = await getContract("Bonfire", sbtAbi);
      const options = { value: ethers.utils.parseEther("0.2") };
      mintIndex = await contract.mintWithReferral(address, options);
    }
    console.log({ mintIndex });
    return true;
  } catch (e) {
    console.log({ mint_error: e });
    return false;
  }
  //TODO; minted listen
}

export async function refer(address) {
  const { contract } = await getContract("Bonfire");
  contract.refer(address);

  //TODO; refer listen
}

// https://stackoverflow.com/questions/72276562/ethers-js-set-noonce-when-using-contract-object
export async function sendMultiFavos(address, num) {
  const { contract } = await getContract("Bonfire", sbtAbi);
  // const { ethereum } = window;
  // const provider = new ethers.providers.Web3Provider(ethereum);
  // const signer = provider?.getSigner();
  // const contract = new ethers.Contract(
  //     CONTRACT_ADDRESS,
  //     CONTRACT_ABI,
  //     signer
  // );
  const provider = await getProvider();
  const nonce = await provider.getTransactionCount(contract.address);
  const tx = await contract.addFavos(address, num, {
    // gasLimit: gasLimit,
    // gasPrice: gasPrice,
    value: ethers.utils.parseEther("0.01"),
    nonce: nonce,
  });
}

export async function addMultiFavos(favoritList) {
  const { contract } = await getContract("Bonfire", sbtAbi);
  const addressList = [];
  const favoAmountList = [];
  for (let i = 0; i < favoritList.length; i++) {
    addressList.push(favoritList[i].eoa);
    favoAmountList.push(favoritList[i].volume);
  }
  console.log(contract);
  console.log({ アドレスリスト: addressList, いいねリスト: favoAmountList });
  // 空の配列で実験
  // await contract.addFavosFromMultipleUsers([], []);
  await contract.addFavosFromMultipleUsers(addressList, favoAmountList);
}

export async function _addFavos(address, num) {
  const { contract } = await getContract("Bonfire", sbtAbi);
  console.log(address);
  // const nonce = await getNonce(address)
  // console.log("nonceは", nonce)
  contract.addFavos(address, num);
}

export async function addFavos(address, num) {
  console.log({ addFavos: address });
  try {
    _addFavos(address, num);
    // sendMultiFavos(address, num)
    console.log("favo saved");
  } catch (e) {
    console.log(e);
    throw new Error(e);
  }
}
