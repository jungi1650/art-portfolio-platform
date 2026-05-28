import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import { connectWallet } from "../lib/mintNFT";
import {
  saveWalletAddressApi,
  getMyWalletAddressApi,
} from "../api/user";

export default function WalletConnectCard() {
  const [registeredWallet, setRegisteredWallet] = useState("");
  const [currentWallet, setCurrentWallet] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const token = getToken();
        const data = await getMyWalletAddressApi(token);
        setRegisteredWallet(data.user?.walletAddress || "");
      } catch (error) {
        console.error(error);
      }
    };

    fetchWallet();
  }, []);

  const handleConnectAndSave = async () => {
    try {
      setLoading(true);

      const token = getToken();
      const { address } = await connectWallet();

      setCurrentWallet(address);

      const saved = await saveWalletAddressApi(token, address);
      setRegisteredWallet(saved.user.walletAddress);

      alert("지갑 주소가 저장되었습니다.");
    } catch (error) {
      console.error(error);
      alert(error.message || "지갑 저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>내 지갑 연결</h3>
      <p style={styles.desc}>
        등록된 지갑 주소로만 NFT 민팅이 가능하도록 설정할 수 있습니다.
      </p>

      <button onClick={handleConnectAndSave} style={styles.button} disabled={loading}>
        {loading ? "연결 중..." : "MetaMask 연결 및 저장"}
      </button>

      <div style={styles.infoBox}>
        <p>
          <strong>등록된 지갑:</strong>{" "}
          {registeredWallet || "등록된 지갑이 없습니다."}
        </p>
        <p>
          <strong>현재 연결 지갑:</strong>{" "}
          {currentWallet || "아직 연결되지 않았습니다."}
        </p>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
    border: "1px solid #e5e7eb",
  },
  title: {
    marginTop: 0,
    marginBottom: "10px",
    fontSize: "22px",
    fontWeight: "800",
    color: "#111827",
  },
  desc: {
    marginTop: 0,
    marginBottom: "16px",
    color: "#6b7280",
    lineHeight: 1.6,
  },
  button: {
    padding: "12px 16px",
    border: "none",
    borderRadius: "14px",
    background: "#7c3aed",
    color: "#fff",
    fontWeight: "800",
    cursor: "pointer",
  },
  infoBox: {
    marginTop: "16px",
    padding: "14px",
    borderRadius: "14px",
    background: "#f9fafb",
    lineHeight: 1.7,
    wordBreak: "break-all",
  },
};