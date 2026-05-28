import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getPortfolioDetailApi,
  saveMintResultApi,
  prepareMintApi,
} from "../api/portfolio";
import { getToken, removeToken } from "../utils/auth";
import { mintNFT, connectWallet } from "../lib/mintNFT";

function PortfolioDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState("");
  const [minting, setMinting] = useState(false);
  const [txHash, setTxHash] = useState("");

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const token = getToken();
        const data = await getPortfolioDetailApi(token, id);
        setPortfolio(data.portfolio);
      } catch (error) {
        alert(error.message);
        removeToken();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [id, navigate]);

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
      setMinting(true);

      const token = getToken();
      const prepared = await prepareMintApi(token, portfolio.id);
      const mintResult = await mintNFT(prepared.tokenURI);

      const saved = await saveMintResultApi(token, portfolio.id, {
        ipfsHash: prepared.ipfsHash,
        metadataUrl: prepared.metadataUrl,
        tokenId: mintResult.tokenId,
        txHash: mintResult.txHash,
        ownerAddress: mintResult.ownerAddress,
        contractAddress: mintResult.contractAddress,
      });

      setPortfolio(saved.portfolio);
      setTxHash(mintResult.txHash);

      alert("NFT 민팅 및 IPFS 저장이 완료되었습니다.");
    } catch (error) {
      console.error(error);
      alert(error.message || "민팅 중 오류가 발생했습니다.");
    } finally {
      setMinting(false);
    }
  };

  const shortAddress = (value) => {
    if (!value) return "-";
    if (value.length < 14) return value;
    return `${value.slice(0, 8)}...${value.slice(-6)}`;
  };

  const convertIpfsToGateway = (ipfsUrl) => {
    if (!ipfsUrl || !ipfsUrl.startsWith("ipfs://")) return null;
    return `https://gateway.pinata.cloud/ipfs/${ipfsUrl.replace("ipfs://", "")}`;
  };

  const metadataGatewayUrl = convertIpfsToGateway(portfolio?.metadataUrl);
  const imageGatewayUrl = portfolio?.ipfsHash
    ? `https://gateway.pinata.cloud/ipfs/${portfolio.ipfsHash}`
    : null;

  if (loading) {
    return <div style={styles.loading}>작품 불러오는 중...</div>;
  }

  if (!portfolio) {
    return <div style={styles.loading}>작품 정보가 없습니다.</div>;
  }

  return (
    <div style={styles.wrapper}>
      <main style={styles.container}>
        <section style={styles.headerCard}>
          <div>
            <p style={styles.badge}>PORTFOLIO DETAIL</p>
            <h1 style={styles.pageTitle}>작품 상세 보기</h1>
            <p style={styles.pageDesc}>
              작품 정보와 NFT 인증 상태를 확인할 수 있습니다.
            </p>
          </div>

          <button onClick={() => navigate(-1)} style={styles.backButton}>
            뒤로가기
          </button>
        </section>

        <section style={styles.mainCard}>
          <div style={styles.imagePanel}>
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}${portfolio.imageUrl}`}
              alt={portfolio.title}
              style={styles.image}
            />

            {portfolio.isMinted && (
              <span style={styles.imageBadge}>NFT 인증 완료</span>
            )}
          </div>

          <div style={styles.detailPanel}>
            <section style={styles.topInfo}>
              <div style={styles.badgeRow}>
                <span
                  style={
                    portfolio.isMinted
                      ? styles.certifiedBadge
                      : styles.pendingBadge
                  }
                >
                  {portfolio.isMinted ? "NFT 인증" : "NFT 미인증"}
                </span>

                <span style={styles.categoryBadge}>
                  {portfolio.category || "기타"}
                </span>
              </div>

              <h2 style={styles.title}>{portfolio.title}</h2>
              <p style={styles.description}>
                {portfolio.description || "설명이 없습니다."}
              </p>
            </section>

            <section style={styles.infoCard}>
              <div style={styles.cardHead}>
                <div style={styles.iconBox}>i</div>
                <div>
                  <h3 style={styles.sectionTitle}>작품 정보</h3>
                  <p style={styles.cardDesc}>
                    작품 등록 정보와 현재 인증 상태입니다.
                  </p>
                </div>
              </div>

              <InfoRow label="작품 ID" value={`#${portfolio.id}`} />
              <InfoRow
                label="업로드 사용자"
                value={
                portfolio.user?.studentProfile?.studentName ||
                portfolio.user?.name ||
                portfolio.user?.email ||
                "알 수 없음"}
              />
              <InfoRow
                label="민팅 상태"
                value={portfolio.isMinted ? "완료" : "미완료"}
                success={portfolio.isMinted}
                warning={!portfolio.isMinted}
              />
              <InfoRow
                label="생성일"
                value={new Date(portfolio.createdAt).toLocaleString()}
              />
            </section>

            {portfolio.isMinted ? (
              <section style={styles.nftCard}>
                <div style={styles.cardHead}>
                  <div style={styles.iconBox}>✓</div>
                  <div>
                    <h3 style={styles.sectionTitle}>NFT 인증 정보</h3>
                    <p style={styles.cardDesc}>
                      블록체인에 기록된 작품 인증 정보입니다.
                    </p>
                  </div>
                </div>

                <InfoRow label="Token ID" value={`#${portfolio.tokenId || "-"}`} />
                <InfoRow
                  label="트랜잭션"
                  value={shortAddress(portfolio.txHash || txHash)}
                  hash
                />
                <InfoRow
                  label="소유자 주소"
                  value={shortAddress(portfolio.ownerAddress)}
                  hash
                />
                <InfoRow
                  label="컨트랙트 주소"
                  value={shortAddress(portfolio.contractAddress)}
                  hash
                />

                <InfoBlock label="IPFS Hash" value={portfolio.ipfsHash || "-"} />
                <InfoBlock
                  label="Metadata URL"
                  value={portfolio.metadataUrl || "-"}
                />

                <div style={styles.linkGroup}>
                  {(portfolio.txHash || txHash) && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${
                        portfolio.txHash || txHash
                      }`}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.primaryLink}
                    >
                      블록체인에서 보기
                    </a>
                  )}

                  {metadataGatewayUrl && (
                    <a
                      href={metadataGatewayUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.secondaryLink}
                    >
                      메타데이터 보기
                    </a>
                  )}

                  {imageGatewayUrl && (
                    <a
                      href={imageGatewayUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.secondaryLink}
                    >
                      IPFS 이미지 보기
                    </a>
                  )}
                </div>
              </section>
            ) : (
              <section style={styles.notMintedCard}>
                <div style={styles.cardHead}>
                  <div style={styles.iconBox}>＋</div>
                  <div>
                    <h3 style={styles.sectionTitle}>NFT 인증 준비</h3>
                    <p style={styles.cardDesc}>
                      지갑을 연결한 뒤 실제 NFT 민팅을 진행할 수 있습니다.
                    </p>
                  </div>
                </div>

                <div style={styles.mintGuide}>
                  <strong>민팅 과정</strong>
                  <p>
                    이미지와 메타데이터를 IPFS에 저장한 뒤, MetaMask를 통해
                    Sepolia 테스트넷에 NFT를 발행합니다.
                  </p>
                </div>

                <div style={styles.buttonRow}>
                  <button
                    onClick={handleConnectWallet}
                    style={styles.connectButton}
                  >
                    지갑 연결
                  </button>

                  <button
                    onClick={handleMint}
                    disabled={minting}
                    style={{
                      ...styles.mintButton,
                      ...(minting ? styles.disabledMintButton : {}),
                    }}
                  >
                    {minting ? "민팅 중..." : "NFT 민팅"}
                  </button>
                </div>

                {walletAddress && (
                  <InfoBlock label="연결된 지갑" value={walletAddress} />
                )}

                {txHash && <InfoBlock label="트랜잭션 해시" value={txHash} />}
              </section>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function InfoRow({ label, value, success, warning, hash }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.label}>{label}</span>
      <strong
        style={
          success
            ? styles.successText
            : warning
            ? styles.warningText
            : hash
            ? styles.hashValue
            : styles.value
        }
      >
        {value}
      </strong>
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div style={styles.infoBlock}>
      <span style={styles.blockLabel}>{label}</span>
      <div style={styles.blockValue}>{value}</div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #eef5ff 0%, #f1f5f9 38%, #eef2f7 100%)",
    color: "#0f172a",
  },
  loading: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    color: "#334155",
    background: "#f1f5f9",
  },
  container: {
    maxWidth: "1680px",
    margin: "0 auto",
    padding: "46px 56px 82px",
  },
  headerCard: {
    background: "rgba(255,255,255,0.9)",
    borderRadius: "24px",
    padding: "28px",
    border: "1px solid rgba(226,232,240,0.95)",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "24px",
    marginBottom: "26px",
  },
  badge: {
    display: "inline-flex",
    margin: 0,
    marginBottom: "14px",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "#e8f3ff",
    color: "#2081e2",
    fontSize: "12px",
    fontWeight: "950",
    letterSpacing: "1.2px",
  },
  pageTitle: {
    margin: 0,
    fontSize: "42px",
    fontWeight: "950",
    color: "#0f172a",
    letterSpacing: "-1px",
  },
  pageDesc: {
    margin: "12px 0 0",
    color: "#64748b",
    fontSize: "16px",
  },
  backButton: {
    padding: "13px 17px",
    border: "none",
    borderRadius: "14px",
    background: "#0f172a",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "950",
  },
  mainCard: {
    display: "grid",
    gridTemplateColumns: "1.08fr 0.92fr",
    gap: "28px",
    background: "rgba(255,255,255,0.9)",
    borderRadius: "28px",
    padding: "26px",
    boxShadow: "0 28px 70px rgba(15, 23, 42, 0.12)",
    border: "1px solid rgba(226,232,240,0.95)",
  },
  imagePanel: {
    position: "relative",
    borderRadius: "24px",
    overflow: "hidden",
    background: "#f8fafc",
    minHeight: "720px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #e5e7eb",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
  },
  imageBadge: {
    position: "absolute",
    top: "18px",
    left: "18px",
    padding: "8px 13px",
    borderRadius: "999px",
    background: "rgba(32, 129, 226, 0.96)",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "950",
  },
  detailPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  topInfo: {
    background: "#ffffff",
    borderRadius: "22px",
    padding: "24px",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
    border: "1px solid #e5e7eb",
  },
  badgeRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "14px",
    flexWrap: "wrap",
  },
  certifiedBadge: {
    padding: "8px 13px",
    borderRadius: "999px",
    background: "#dcfce7",
    color: "#15803d",
    fontWeight: "950",
    fontSize: "12px",
  },
  pendingBadge: {
    padding: "8px 13px",
    borderRadius: "999px",
    background: "#fff7ed",
    color: "#c2410c",
    fontWeight: "950",
    fontSize: "12px",
  },
  categoryBadge: {
    padding: "8px 13px",
    borderRadius: "999px",
    background: "#e8f3ff",
    color: "#2081e2",
    fontWeight: "950",
    fontSize: "12px",
  },
  title: {
    margin: 0,
    fontSize: "34px",
    fontWeight: "950",
    color: "#0f172a",
  },
  description: {
    marginTop: "12px",
    marginBottom: 0,
    color: "#475569",
    fontSize: "15px",
    lineHeight: 1.8,
  },
  infoCard: {
    background: "#ffffff",
    borderRadius: "22px",
    padding: "24px",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
    border: "1px solid #e5e7eb",
  },
  nftCard: {
    background: "#ffffff",
    borderRadius: "22px",
    padding: "24px",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
    border: "1px solid #dbeafe",
  },
  notMintedCard: {
    background: "#ffffff",
    borderRadius: "22px",
    padding: "24px",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
    border: "1px solid #dbeafe",
  },
  cardHead: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "18px",
  },
  iconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    background: "#e8f3ff",
    color: "#2081e2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "950",
    fontSize: "20px",
    flexShrink: 0,
  },
  sectionTitle: {
    margin: 0,
    fontSize: "21px",
    fontWeight: "950",
    color: "#0f172a",
  },
  cardDesc: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.5,
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    padding: "13px 0",
    borderBottom: "1px solid #edf2f7",
  },
  label: {
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "850",
  },
  value: {
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: "950",
    textAlign: "right",
  },
  hashValue: {
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: "950",
    wordBreak: "break-all",
    textAlign: "right",
  },
  successText: {
    color: "#15803d",
    fontSize: "14px",
    fontWeight: "950",
  },
  warningText: {
    color: "#c2410c",
    fontSize: "14px",
    fontWeight: "950",
  },
  infoBlock: {
    marginTop: "14px",
    padding: "15px 16px",
    borderRadius: "16px",
    background: "#f8fbff",
    border: "1px solid #dbeafe",
  },
  blockLabel: {
    display: "block",
    marginBottom: "8px",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "850",
  },
  blockValue: {
    color: "#0f172a",
    fontSize: "14px",
    lineHeight: 1.6,
    wordBreak: "break-all",
  },
  linkGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "18px",
  },
  primaryLink: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "11px 15px",
    borderRadius: "13px",
    background: "#2081e2",
    color: "#fff",
    textDecoration: "none",
    fontWeight: "950",
    fontSize: "14px",
    boxShadow: "0 12px 24px rgba(32,129,226,0.22)",
  },
  secondaryLink: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "11px 15px",
    borderRadius: "13px",
    background: "#ffffff",
    color: "#2081e2",
    textDecoration: "none",
    fontWeight: "950",
    fontSize: "14px",
    border: "1px solid #bfdbfe",
  },
  mintGuide: {
    padding: "16px",
    borderRadius: "16px",
    background: "#f8fbff",
    border: "1px solid #dbeafe",
    color: "#475569",
    lineHeight: 1.6,
    marginBottom: "16px",
  },
  buttonRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  connectButton: {
    padding: "13px 16px",
    border: "1px solid #dbeafe",
    borderRadius: "14px",
    background: "#ffffff",
    color: "#2081e2",
    cursor: "pointer",
    fontWeight: "950",
  },
  mintButton: {
    padding: "13px 16px",
    border: "none",
    borderRadius: "14px",
    background: "#2081e2",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "950",
    boxShadow: "0 12px 24px rgba(32,129,226,0.22)",
  },
  disabledMintButton: {
    background: "#93c5fd",
    cursor: "not-allowed",
  },
};

export default PortfolioDetailPage;