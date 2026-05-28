import { useState } from "react";
import { connectWallet, mintNFT } from "../lib/mintNFT";

export default function MintButton() {
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [mintResult, setMintResult] = useState(null);

  const handleConnectWallet = async () => {
    try {
      const { address } = await connectWallet();
      setWalletAddress(address);
    } catch (error) {
      console.error(error);
      alert(error.message || "지갑 연결에 실패했습니다.");
    }
  };

  const handleMint = async () => {
    try {
      setLoading(true);
      setMintResult(null);

      // 지금은 테스트용 임시 tokenURI
      // 나중에는 백엔드/IPFS에서 받아온 실제 metadata URI로 교체
      const tokenURI = "ipfs://example-metadata-uri";

      const result = await mintNFT(tokenURI);
      setMintResult(result);

      alert("NFT 민팅이 완료되었습니다.");
    } catch (error) {
      console.error(error);
      alert(error.message || "민팅 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "12px" }}>
      <h3>NFT 민팅 테스트</h3>

      <button onClick={handleConnectWallet} style={{ marginRight: "8px" }}>
        지갑 연결
      </button>

      <button onClick={handleMint} disabled={loading}>
        {loading ? "민팅 중..." : "NFT 민팅"}
      </button>

      {walletAddress && (
        <p style={{ marginTop: "12px" }}>
          <strong>지갑 주소:</strong> {walletAddress}
        </p>
      )}

      {mintResult && (
        <div style={{ marginTop: "12px" }}>
          <p>
            <strong>소유자 주소:</strong> {mintResult.ownerAddress}
          </p>
          <p>
            <strong>트랜잭션 해시:</strong> {mintResult.txHash}
          </p>
        </div>
      )}
    </div>
  );
}