import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract";

const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask가 설치되어 있어야 합니다.");
  }

  await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { provider, signer, address };
}

export async function ensureSepoliaNetwork() {
  if (!window.ethereum) {
    throw new Error("MetaMask가 설치되어 있어야 합니다.");
  }

  const currentChainId = await window.ethereum.request({
    method: "eth_chainId",
  });

  if (currentChainId.toLowerCase() === SEPOLIA_CHAIN_ID_HEX) {
    return;
  }

  await window.ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
  });
}

export async function mintNFT(tokenURI) {
  if (!tokenURI || typeof tokenURI !== "string") {
    throw new Error("유효한 tokenURI가 필요합니다.");
  }

  await ensureSepoliaNetwork();

  const { signer, address } = await connectWallet();

  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    signer
  );

  const tx = await contract.mint(address, tokenURI);
  const receipt = await tx.wait();

  let tokenId = null;

  for (const log of receipt.logs) {
    try {
      const parsedLog = contract.interface.parseLog(log);
      if (parsedLog && parsedLog.name === "Transfer") {
        tokenId = parsedLog.args.tokenId.toString();
        break;
      }
    } catch (error) {
      // 무시
    }
  }

  return {
    txHash: receipt.hash,
    ownerAddress: address,
    contractAddress: CONTRACT_ADDRESS,
    tokenId,
  };
}