import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import { connectWallet } from "../lib/mintNFT";
import {
  getMeApi,
  saveWalletAddressApi,
  deleteWalletAddressApi,
  changePasswordApi,
} from "../api/user";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [currentWallet, setCurrentWallet] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordCheck, setNewPasswordCheck] = useState("");

  const [loading, setLoading] = useState(true);
  const [walletLoading, setWalletLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const fetchUser = async () => {
    try {
      const token = getToken();
      const data = await getMeApi(token);

      setUser(data.user);
      setWalletAddress(data.user?.walletAddress || "");
    } catch (error) {
      console.error(error);
      alert(error.message || "사용자 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const shortAddress = (address) => {
    if (!address) return "등록된 지갑이 없습니다.";
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  const handleConnectAndSaveWallet = async () => {
    try {
      setWalletLoading(true);

      const { address } = await connectWallet();
      const normalizedAddress = address.toLowerCase();

      setCurrentWallet(normalizedAddress);

      const token = getToken();
      const saved = await saveWalletAddressApi(token, normalizedAddress);

      setUser(saved.user);
      setWalletAddress(saved.user.walletAddress || "");

      alert("지갑 주소가 연결 및 저장되었습니다.");
    } catch (error) {
      console.error(error);
      alert(error.message || "지갑 연결/저장 실패");
    } finally {
      setWalletLoading(false);
    }
  };

  const handleDeleteWallet = async () => {
    try {
      if (!window.confirm("등록된 지갑 주소를 삭제할까요?")) return;

      setWalletLoading(true);

      const token = getToken();
      const result = await deleteWalletAddressApi(token);

      setUser(result.user);
      setWalletAddress("");
      setCurrentWallet("");

      alert("지갑 주소가 삭제되었습니다.");
    } catch (error) {
      console.error(error);
      alert(error.message || "지갑 삭제 실패");
    } finally {
      setWalletLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!currentPassword || !newPassword || !newPasswordCheck) {
        alert("비밀번호 입력값을 모두 채워주세요.");
        return;
      }

      if (newPassword !== newPasswordCheck) {
        alert("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
        return;
      }

      setPasswordLoading(true);

      const token = getToken();
      await changePasswordApi(token, currentPassword, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordCheck("");
      setShowPasswordForm(false);

      alert("비밀번호가 변경되었습니다.");
    } catch (error) {
      console.error(error);
      alert(error.message || "비밀번호 변경 실패");
    } finally {
      setPasswordLoading(false);
    }
  };

  const isStudent = user?.role === "student";
  const isParent = user?.role === "parent";
  const isMentor = user?.role === "mentor";

  const roleLabel = isStudent
    ? "학생"
    : isParent
    ? "학부모"
    : isMentor
    ? "멘토"
    : user?.role || "-";

  const displayName =
    user?.studentProfile?.studentName ||
    user?.name ||
    user?.email ||
    "사용자";

  const isWalletMatched =
    walletAddress &&
    currentWallet &&
    walletAddress.toLowerCase() === currentWallet.toLowerCase();

  if (loading) {
    return <div style={styles.loading}>내 정보 불러오는 중...</div>;
  }

  return (
    <div style={styles.wrapper}>
      <main style={styles.container}>
        <section style={styles.header}>
          <p style={styles.badge}>MY PROFILE</p>
          <h1 style={styles.title}>내 정보 관리</h1>
          <p style={styles.subtitle}>
            계정 정보, 지갑 주소, 보안 설정을 한 곳에서 관리합니다.
          </p>
        </section>

        <section style={styles.heroCard}>
          <div style={styles.avatar}>{displayName.slice(0, 1).toUpperCase()}</div>

          <div style={styles.heroInfo}>
            <h2 style={styles.name}>{displayName}</h2>
            <p style={styles.email}>{user?.email || "-"}</p>

            <div style={styles.pillRow}>
              <span style={styles.rolePill}>{roleLabel}</span>
              <span style={walletAddress ? styles.greenPill : styles.orangePill}>
                {walletAddress ? "지갑 연결됨" : "지갑 미등록"}
              </span>
            </div>
          </div>

          <div style={styles.heroWallet}>
            <div style={styles.walletIcon}>▣</div>
            <div>
              <p style={styles.heroWalletLabel}>등록된 지갑 주소</p>
              <strong style={styles.heroWalletText}>
                {shortAddress(walletAddress)}
              </strong>
            </div>
          </div>
        </section>

        <section style={styles.cardGrid}>
          <section style={styles.card}>
            <div style={styles.cardHead}>
              <div style={styles.iconBox}>U</div>
              <div>
                <h2 style={styles.cardTitle}>기본 정보</h2>
                <p style={styles.cardDesc}>서비스 이용을 위한 계정 정보입니다.</p>
              </div>
            </div>

            <InfoRow icon="@" label="이메일" value={user?.email || "-"} />
            <InfoRow icon="■" label="역할" value={roleLabel} />

            {isStudent && (
              <>
                <InfoRow
                  icon="S"
                  label="학생 이름"
                  value={user?.studentProfile?.studentName || "-"}
                />
                <InfoRow
                  icon="A"
                  label="소속/학원명"
                  value={user?.studentProfile?.academyName || "-"}
                />
                <InfoRow
                  icon="✓"
                  label="승인 상태"
                  value={user?.studentProfile?.isApproved ? "승인됨" : "미승인"}
                  success={user?.studentProfile?.isApproved}
                />
              </>
            )}

            {isParent && (
              <InfoRow icon="P" label="학부모 이름" value={user?.name || "-"} />
            )}

            {isMentor && (
              <>
                <InfoRow icon="M" label="멘토 이름" value={user?.name || "-"} />
                <InfoRow
                  icon="★"
                  label="전문 분야"
                  value={user?.mentorField || "-"}
                />
                <InfoRow icon="✎" label="멘토 소개" value={user?.bio || "-"} />
              </>
            )}
          </section>

          <section style={styles.card}>
            <div style={styles.cardHead}>
              <div style={styles.iconBox}>W</div>
              <div>
                <h2 style={styles.cardTitle}>지갑 관리</h2>
                <p style={styles.cardDesc}>
                  등록 지갑과 현재 MetaMask 지갑을 확인합니다.
                </p>
              </div>
            </div>

            <div style={styles.walletBlueBox}>
              <p style={styles.boxLabel}>등록된 지갑 주소</p>
              <strong style={styles.address}>{shortAddress(walletAddress)}</strong>
              <p style={styles.boxHint}>
                실제 NFT 소유권은 이 지갑 주소를 기준으로 기록됩니다.
              </p>
            </div>

            <div style={styles.walletStatusBox}>
              <div>
                <p style={styles.boxLabel}>현재 연결된 MetaMask</p>
                <strong style={styles.address}>
                  {currentWallet ? shortAddress(currentWallet) : "아직 확인 안 됨"}
                </strong>
              </div>

              {currentWallet && (
                <span style={isWalletMatched ? styles.matchBadge : styles.warnBadge}>
                  {isWalletMatched ? "일치" : "불일치"}
                </span>
              )}
            </div>

            <div style={styles.buttonRow}>
              <button
                onClick={handleConnectAndSaveWallet}
                disabled={walletLoading}
                style={styles.primaryButton}
              >
                {walletLoading ? "처리 중..." : "MetaMask 연결 및 저장"}
              </button>

              <button
                onClick={handleDeleteWallet}
                disabled={walletLoading || !walletAddress}
                style={styles.dangerButton}
              >
                지갑 삭제
              </button>
            </div>
          </section>

          <section style={styles.card}>
            <div style={styles.cardHead}>
              <div style={styles.iconBox}>S</div>
              <div>
                <h2 style={styles.cardTitle}>보안 설정</h2>
                <p style={styles.cardDesc}>
                  계정 보안을 위한 비밀번호를 관리합니다.
                </p>
              </div>
            </div>

            <div style={styles.securityBox}>
              <div>
                <h3 style={styles.securityTitle}>비밀번호 변경</h3>
                <p style={styles.securityText}>
                  정기적으로 비밀번호를 변경하여 계정을 안전하게 보호하세요.
                </p>
              </div>

              <button
                onClick={() => setShowPasswordForm((prev) => !prev)}
                style={styles.outlineButton}
              >
                {showPasswordForm ? "닫기" : "변경하기"}
              </button>
            </div>

            {showPasswordForm && (
              <div style={styles.passwordForm}>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={styles.input}
                  placeholder="현재 비밀번호"
                />

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={styles.input}
                  placeholder="새 비밀번호"
                />

                <input
                  type="password"
                  value={newPasswordCheck}
                  onChange={(e) => setNewPasswordCheck(e.target.value)}
                  style={styles.input}
                  placeholder="새 비밀번호 확인"
                />

                <button
                  onClick={handleChangePassword}
                  disabled={passwordLoading}
                  style={styles.passwordButton}
                >
                  {passwordLoading ? "변경 중..." : "변경 저장"}
                </button>
              </div>
            )}

            <div style={styles.tipBox}>
              <strong>안전한 비밀번호 관리 팁</strong>
              <p>영문, 숫자, 특수문자를 조합하고 이전 비밀번호 재사용을 피하세요.</p>
            </div>
          </section>
        </section>

        <section style={styles.guideBar}>
          <div style={styles.guideIcon}>★</div>
          <div>
            <strong>NFT 민팅 안내</strong>
            <p>
              NFT 민팅 전 MetaMask 지갑을 연결하고, 등록 지갑 주소와 일치하는지
              확인하세요.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

function InfoRow({ icon, label, value, success }) {
  return (
    <div style={styles.infoRow}>
      <div style={styles.infoLeft}>
        <span style={styles.infoIcon}>{icon}</span>
        <span style={styles.infoLabel}>{label}</span>
      </div>
      <strong style={success ? styles.successValue : styles.infoValue}>
        {value}
      </strong>
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
    background: "#f1f5f9",
    color: "#334155",
  },
  container: {
    maxWidth: "1500px",
    margin: "0 auto",
    padding: "48px 52px 72px",
  },
  header: {
    marginBottom: "26px",
  },
  badge: {
    display: "inline-flex",
    margin: 0,
    marginBottom: "14px",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "#ffffff",
    color: "#2081e2",
    fontSize: "12px",
    fontWeight: "950",
    letterSpacing: "1.2px",
    boxShadow: "0 8px 20px rgba(32, 129, 226, 0.08)",
  },
  title: {
    margin: 0,
    fontSize: "44px",
    fontWeight: "950",
    letterSpacing: "-1px",
  },
  subtitle: {
    marginTop: "12px",
    color: "#64748b",
    fontSize: "16px",
  },
  heroCard: {
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(10px)",
    borderRadius: "24px",
    padding: "30px",
    border: "1px solid rgba(226,232,240,0.95)",
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.10)",
    display: "grid",
    gridTemplateColumns: "90px 1fr 430px",
    alignItems: "center",
    gap: "24px",
    marginBottom: "28px",
  },
  avatar: {
    width: "82px",
    height: "82px",
    borderRadius: "26px",
    background: "linear-gradient(135deg, #2081e2, #4338ca)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "34px",
    fontWeight: "950",
    boxShadow: "0 16px 30px rgba(32,129,226,0.28)",
  },
  heroInfo: {
    minWidth: 0,
  },
  name: {
    margin: 0,
    fontSize: "30px",
    fontWeight: "950",
  },
  email: {
    margin: "8px 0 12px",
    color: "#64748b",
    fontSize: "15px",
  },
  pillRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  rolePill: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "#eef6ff",
    color: "#1d4ed8",
    fontSize: "12px",
    fontWeight: "950",
  },
  greenPill: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "#dcfce7",
    color: "#15803d",
    fontSize: "12px",
    fontWeight: "950",
  },
  orangePill: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "#ffedd5",
    color: "#c2410c",
    fontSize: "12px",
    fontWeight: "950",
  },
  heroWallet: {
    borderLeft: "1px solid #e5e7eb",
    paddingLeft: "32px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  walletIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "18px",
    background: "#e8f3ff",
    color: "#2081e2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "950",
  },
  heroWalletLabel: {
    margin: "0 0 8px",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "800",
  },
  heroWalletText: {
    fontSize: "18px",
    fontWeight: "950",
    wordBreak: "break-all",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "26px",
  },
  card: {
    background: "rgba(255,255,255,0.9)",
    borderRadius: "22px",
    padding: "26px",
    border: "1px solid rgba(226,232,240,0.95)",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
  },
  cardHead: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "22px",
  },
  iconBox: {
    width: "56px",
    height: "56px",
    borderRadius: "17px",
    background: "#e8f3ff",
    color: "#2081e2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "950",
    flexShrink: 0,
  },
  cardTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "950",
  },
  cardDesc: {
    margin: "7px 0 0",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    padding: "15px 0",
    borderBottom: "1px solid #edf2f7",
  },
  infoLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  infoIcon: {
    width: "28px",
    textAlign: "center",
    fontSize: "14px",
    fontWeight: "950",
    color: "#2081e2",
    flexShrink: 0,
  },
  infoLabel: {
    color: "#334155",
    fontSize: "14px",
    fontWeight: "800",
  },
  infoValue: {
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: "950",
    textAlign: "right",
    maxWidth: "180px",
    whiteSpace: "pre-wrap",
  },
  successValue: {
    color: "#16a34a",
    fontSize: "14px",
    fontWeight: "950",
    textAlign: "right",
  },
  walletBlueBox: {
    padding: "18px",
    borderRadius: "18px",
    background: "linear-gradient(135deg, #e8f3ff, #f1f7ff)",
    border: "1px solid #bfdbfe",
    marginBottom: "14px",
  },
  walletStatusBox: {
    padding: "16px",
    borderRadius: "16px",
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
  },
  boxLabel: {
    margin: "0 0 8px",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "850",
  },
  address: {
    display: "block",
    fontSize: "16px",
    fontWeight: "950",
    color: "#0f172a",
    wordBreak: "break-all",
  },
  boxHint: {
    margin: "10px 0 0",
    color: "#475569",
    fontSize: "13px",
    lineHeight: 1.5,
  },
  matchBadge: {
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#dcfce7",
    color: "#15803d",
    fontSize: "12px",
    fontWeight: "950",
  },
  warnBadge: {
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#fee2e2",
    color: "#dc2626",
    fontSize: "12px",
    fontWeight: "950",
  },
  buttonRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  primaryButton: {
    flex: 1,
    padding: "14px 16px",
    border: "none",
    borderRadius: "15px",
    background: "#2081e2",
    color: "#fff",
    fontWeight: "950",
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(32,129,226,0.25)",
  },
  dangerButton: {
    padding: "14px 16px",
    borderRadius: "15px",
    border: "1px solid #fecaca",
    background: "#fff",
    color: "#ef4444",
    fontWeight: "950",
    cursor: "pointer",
  },
  securityBox: {
    padding: "18px",
    borderRadius: "18px",
    border: "1px solid #e5e7eb",
    background: "#fbfdff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
  },
  securityTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "950",
  },
  securityText: {
    margin: "8px 0 0",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.5,
  },
  outlineButton: {
    padding: "11px 14px",
    borderRadius: "13px",
    border: "1px solid #bfdbfe",
    background: "#ffffff",
    color: "#2081e2",
    fontWeight: "950",
    cursor: "pointer",
    flexShrink: 0,
  },
  passwordForm: {
    marginTop: "16px",
  },
  input: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: "14px",
    border: "1px solid #dbe3ef",
    background: "#fff",
    color: "#0f172a",
    outline: "none",
    marginBottom: "10px",
  },
  passwordButton: {
    width: "100%",
    padding: "13px 16px",
    border: "none",
    borderRadius: "14px",
    background: "#0f172a",
    color: "#fff",
    fontWeight: "950",
    cursor: "pointer",
  },
  tipBox: {
    marginTop: "16px",
    padding: "16px",
    borderRadius: "16px",
    background: "#f1f5f9",
    color: "#475569",
    fontSize: "13px",
    lineHeight: 1.6,
  },
  guideBar: {
    marginTop: "28px",
    background: "rgba(255,255,255,0.9)",
    borderRadius: "20px",
    padding: "20px 24px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.07)",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  guideIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "16px",
    background: "#2081e2",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "950",
  },
};

export default ProfilePage;