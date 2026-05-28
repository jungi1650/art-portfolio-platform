import { useEffect, useState } from "react";
import { getMeApi } from "../api/user";
import {
  getMyPortfoliosApi,
  uploadPortfolioApi,
} from "../api/portfolio";
import { getToken, removeToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";

function StudentDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("드로잉");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  const categories = [
    "드로잉",
    "일러스트",
    "디자인",
    "회화",
    "포스터",
    "3D/모델링",
    "기타",
  ];

  const fetchData = async () => {
    try {
      const token = getToken();
      const me = await getMeApi(token);
      const portfolioData = await getMyPortfoliosApi(token);

      setUser(me.user);
      setPortfolios(portfolioData.portfolios || []);
    } catch (error) {
      console.error(error);
      removeToken();
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim() || !image) {
      setErrorMsg("작품 제목과 이미지는 필수입니다.");
      return;
    }

    try {
      setUploading(true);

      const token = getToken();
      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", category);
      formData.append("image", image);

      await uploadPortfolioApi(token, formData);

      setTitle("");
      setCategory("드로잉");
      setDescription("");
      setImage(null);

      await fetchData();
      alert("업로드 성공");
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setUploading(false);
    }
  };

  const shortAddress = (address) => {
    if (!address) return "등록된 지갑 없음";
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const studentName = user?.studentProfile?.studentName || "학생";
  const academyName = user?.studentProfile?.academyName || "-";
  const mintedCount = portfolios.filter((item) => item.isMinted).length;
  const pendingCount = portfolios.length - mintedCount;

  if (loading) {
    return <div style={styles.loading}>로딩 중...</div>;
  }

  return (
    <div style={styles.wrapper}>
      <main style={styles.container}>
        <section style={styles.header}>
          <div>
            <p style={styles.badge}>STUDENT DASHBOARD</p>
            <h1 style={styles.mainTitle}>내 포트폴리오 관리</h1>
            <p style={styles.subTitle}>
              작품 업로드, 포트폴리오 관리, NFT 인증 상태를 한 곳에서 확인합니다.
            </p>
          </div>

          <div style={styles.heroActions}>
            <button onClick={() => navigate("/profile")} style={styles.outlineButton}>
              내정보 관리
            </button>
            <button onClick={handleLogout} style={styles.logoutButton}>
              로그아웃
            </button>
          </div>
        </section>

        <section style={styles.profileHero}>
          <div style={styles.profileIcon}>
            {studentName.slice(0, 1).toUpperCase()}
          </div>

          <div style={styles.profileMain}>
            <p style={styles.profileLabel}>로그인 계정</p>
            <h2 style={styles.profileName}>{studentName}</h2>
            <p style={styles.profileEmail}>{user?.email || "-"}</p>

            <div style={styles.pillRow}>
              <span style={styles.rolePill}>학생</span>
              <span style={user?.walletAddress ? styles.greenPill : styles.orangePill}>
                {user?.walletAddress ? "지갑 연결됨" : "지갑 미등록"}
              </span>
            </div>
          </div>

          <div style={styles.profileInfoGrid}>
            <InfoBox label="등록 지갑" value={shortAddress(user?.walletAddress)} />
            <InfoBox label="소속/학원명" value={academyName} />
            <InfoBox
              label="승인 상태"
              value={user?.studentProfile?.isApproved ? "승인됨" : "미승인"}
            />
          </div>
        </section>

        <section style={styles.statsGrid}>
          <StatCard icon="A" label="전체 작품" value={`${portfolios.length}개`} />
          <StatCard icon="✓" label="NFT 인증 완료" value={`${mintedCount}개`} />
          <StatCard icon="N" label="NFT 미인증" value={`${pendingCount}개`} />
        </section>

        <section style={styles.mainGrid}>
          <aside style={styles.uploadCard}>
            <div style={styles.cardHead}>
              <div style={styles.iconBox}>UP</div>
              <div>
                <h2 style={styles.sectionTitle}>작품 업로드</h2>
                <p style={styles.sectionDesc}>
                  작품 이미지를 등록한 뒤 상세 페이지에서 NFT 인증을 진행할 수 있습니다.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpload} style={styles.form}>
              <div>
                <label style={styles.label}>작품 제목</label>
                <input
                  type="text"
                  placeholder="작품 제목"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>카테고리</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={styles.input}
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label}>작품 설명</label>
                <textarea
                  placeholder="작품 설명"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={styles.textarea}
                />
              </div>

              <label style={styles.fileBox}>
                <span style={styles.fileIcon}>IMG</span>
                <strong>{image ? image.name : "이미지 파일 선택"}</strong>
                <small>PNG, JPG 등 이미지 파일을 업로드하세요.</small>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  style={styles.hiddenFileInput}
                />
              </label>

              {errorMsg && <p style={styles.error}>{errorMsg}</p>}

              <button type="submit" style={styles.primaryButton} disabled={uploading}>
                {uploading ? "업로드 중..." : "작품 업로드"}
              </button>
            </form>
          </aside>

          <main style={styles.listCard}>
            <div style={styles.sectionHeader}>
              <div>
                <p style={styles.sectionBadge}>MY ARTWORKS</p>
                <h2 style={styles.sectionTitle}>내 작품</h2>
                <p style={styles.sectionDesc}>
                  작품 카드를 클릭하면 상세 정보와 실제 NFT 민팅 기능을 사용할 수 있습니다.
                </p>
              </div>

              <div style={styles.countBadge}>{portfolios.length}개</div>
            </div>

            {portfolios.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>✦</div>
                <p style={styles.emptyTitle}>아직 업로드된 작품이 없습니다.</p>
                <p style={styles.emptyDesc}>왼쪽 업로드 폼에서 첫 작품을 등록해보세요.</p>
              </div>
            ) : (
              <div style={styles.portfolioList}>
                {portfolios.map((item) => (
                  <article
                    key={item.id}
                    style={{
                      ...styles.portfolioItem,
                      ...(hoveredId === item.id ? styles.portfolioItemHover : {}),
                    }}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => navigate(`/portfolio/${item.id}`)}
                  >
                    <div style={styles.imageBox}>
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL}${item.imageUrl}`}
                        alt={item.title}
                        style={styles.image}
                      />

                      {item.isMinted && (
                        <span style={styles.imageBadge}>NFT 인증</span>
                      )}
                    </div>

                    <div style={styles.cardBody}>
                      <span style={styles.categoryBadge}>
                        {item.category || "기타"}
                      </span>

                      <h3 style={styles.cardTitle}>{item.title}</h3>
                      <p style={styles.cardDesc}>{item.description || "설명 없음"}</p>

                      <div style={styles.cardBottom}>
                        <span
                          style={item.isMinted ? styles.statusDone : styles.statusPending}
                        >
                          {item.isMinted ? "인증 완료" : "미인증"}
                        </span>

                        {!item.isMinted && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/portfolio/${item.id}`);
                            }}
                            style={styles.mintButton}
                          >
                            상세에서 민팅
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>
        </section>
      </main>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div style={styles.infoBox}>
      <span style={styles.infoLabel}>{label}</span>
      <strong style={styles.infoValue}>{value}</strong>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcon}>{icon}</div>
      <div>
        <span style={styles.statLabel}>{label}</span>
        <strong style={styles.statValue}>{value}</strong>
      </div>
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
    justifyContent: "center",
    alignItems: "center",
    fontSize: "18px",
    background: "#f1f5f9",
    color: "#0f172a",
  },
  container: {
    maxWidth: "1680px",
    margin: "0 auto",
    padding: "46px 56px 80px",
  },
  header: {
    marginBottom: "28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "24px",
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
    boxShadow: "0 8px 20px rgba(32,129,226,0.08)",
  },
  mainTitle: {
    margin: 0,
    fontSize: "44px",
    fontWeight: "950",
    color: "#0f172a",
    letterSpacing: "-1px",
  },
  subTitle: {
    margin: "12px 0 0",
    color: "#64748b",
    fontSize: "16px",
  },
  heroActions: {
    display: "flex",
    gap: "10px",
  },
  outlineButton: {
    padding: "13px 17px",
    borderRadius: "14px",
    border: "1px solid #bfdbfe",
    background: "#ffffff",
    color: "#2081e2",
    fontWeight: "950",
    cursor: "pointer",
  },
  logoutButton: {
    padding: "13px 17px",
    border: "none",
    borderRadius: "14px",
    background: "#0f172a",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "950",
  },
  profileHero: {
    background: "rgba(255,255,255,0.9)",
    borderRadius: "24px",
    padding: "28px",
    border: "1px solid rgba(226,232,240,0.95)",
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.10)",
    display: "grid",
    gridTemplateColumns: "82px 1fr 540px",
    alignItems: "center",
    gap: "22px",
    marginBottom: "24px",
  },
  profileIcon: {
    width: "76px",
    height: "76px",
    borderRadius: "24px",
    background: "linear-gradient(135deg, #2081e2, #4338ca)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    fontWeight: "950",
    boxShadow: "0 16px 30px rgba(32,129,226,0.25)",
  },
  profileMain: {
    minWidth: 0,
  },
  profileLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "850",
  },
  profileName: {
    margin: "5px 0",
    fontSize: "28px",
    fontWeight: "950",
    color: "#0f172a",
  },
  profileEmail: {
    margin: "0 0 10px",
    color: "#64748b",
    fontSize: "14px",
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
  profileInfoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
  },
  infoBox: {
    padding: "16px",
    borderRadius: "16px",
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
  },
  infoLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "850",
    marginBottom: "7px",
  },
  infoValue: {
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: "950",
    wordBreak: "break-all",
  },
  statsGrid: {
    marginBottom: "24px",
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "18px",
  },
  statCard: {
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(226,232,240,0.95)",
    borderRadius: "22px",
    padding: "22px",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  statIcon: {
  width: "50px",
  height: "50px",
  borderRadius: "16px",
  background: "#e8f3ff",
  color: "#2081e2",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "16px",
  fontWeight: "950",
  },
  statLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "850",
    marginBottom: "5px",
  },
  statValue: {
    color: "#0f172a",
    fontSize: "28px",
    fontWeight: "950",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "360px 1fr",
    gap: "26px",
    alignItems: "start",
  },
  uploadCard: {
    position: "sticky",
    top: "92px",
    background: "rgba(255,255,255,0.9)",
    borderRadius: "22px",
    padding: "24px",
    border: "1px solid rgba(226,232,240,0.95)",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
  },
  listCard: {
    background: "rgba(255,255,255,0.9)",
    borderRadius: "22px",
    padding: "24px",
    border: "1px solid rgba(226,232,240,0.95)",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
  },
  cardHead: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "20px",
  },
  iconBox: {
  width: "52px",
  height: "52px",
  borderRadius: "17px",
  background: "#e8f3ff",
  color: "#2081e2",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "15px",
  fontWeight: "950",
  letterSpacing: "0.5px",
  flexShrink: 0,
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "22px",
    gap: "16px",
  },
  sectionBadge: {
    margin: "0 0 8px",
    color: "#2081e2",
    fontSize: "12px",
    fontWeight: "950",
    letterSpacing: "1px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "950",
    color: "#0f172a",
  },
  sectionDesc: {
    margin: "7px 0 0",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  countBadge: {
    minWidth: "58px",
    height: "40px",
    borderRadius: "999px",
    background: "#e8f3ff",
    color: "#2081e2",
    fontWeight: "950",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 14px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "13px",
    marginTop: "18px",
  },
  label: {
    display: "block",
    marginBottom: "7px",
    color: "#334155",
    fontSize: "13px",
    fontWeight: "850",
  },
  input: {
    width: "100%",
    padding: "14px 15px",
    border: "1px solid #dbe3ef",
    borderRadius: "14px",
    fontSize: "14px",
    color: "#0f172a",
    background: "#fff",
    outline: "none",
  },
  textarea: {
    width: "100%",
    minHeight: "120px",
    padding: "14px 15px",
    border: "1px solid #dbe3ef",
    borderRadius: "14px",
    resize: "vertical",
    fontSize: "14px",
    color: "#0f172a",
    background: "#fff",
    outline: "none",
  },
  fileBox: {
    padding: "18px",
    border: "1px dashed #bfdbfe",
    borderRadius: "18px",
    background: "#f8fbff",
    color: "#334155",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    alignItems: "center",
    textAlign: "center",
  },
  fileIcon: {
  fontSize: "13px",
  fontWeight: "950",
  color: "#2081e2",
  letterSpacing: "0.5px",
  },
  hiddenFileInput: {
    display: "none",
  },
  primaryButton: {
    padding: "15px",
    border: "none",
    borderRadius: "15px",
    background: "#2081e2",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "950",
    fontSize: "15px",
    boxShadow: "0 12px 24px rgba(32,129,226,0.25)",
  },
  error: {
    color: "#dc2626",
    fontSize: "14px",
    margin: 0,
    fontWeight: "850",
  },
  emptyState: {
    border: "1px dashed #bfdbfe",
    borderRadius: "20px",
    padding: "54px 20px",
    textAlign: "center",
    background: "#f8fbff",
  },
  emptyIcon: {
    width: "54px",
    height: "54px",
    borderRadius: "18px",
    background: "#e8f3ff",
    color: "#2081e2",
    margin: "0 auto 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "950",
  },
  emptyTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "950",
    color: "#0f172a",
  },
  emptyDesc: {
    marginTop: "8px",
    color: "#64748b",
  },
  portfolioList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
  },
  portfolioItem: {
    borderRadius: "18px",
    overflow: "hidden",
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(226,232,240,0.95)",
    boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
    cursor: "pointer",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
  },
  portfolioItemHover: {
    transform: "translateY(-4px)",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.14)",
  },
  imageBox: {
    position: "relative",
    aspectRatio: "1 / 1",
    background: "#f3f4f6",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  imageBadge: {
    position: "absolute",
    top: "12px",
    left: "12px",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "rgba(32, 129, 226, 0.95)",
    color: "#fff",
    fontSize: "11px",
    fontWeight: "950",
  },
  cardBody: {
    padding: "15px 16px 16px",
  },
  categoryBadge: {
    display: "inline-block",
    marginBottom: "8px",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#e8f3ff",
    color: "#2081e2",
    fontSize: "11px",
    fontWeight: "950",
  },
  cardTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "950",
    color: "#0f172a",
  },
  cardDesc: {
    margin: "7px 0 14px",
    color: "#64748b",
    lineHeight: 1.45,
    minHeight: "38px",
    fontSize: "13px",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  cardBottom: {
    paddingTop: "12px",
    borderTop: "1px solid #f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  },
  statusPending: {
    display: "inline-block",
    padding: "7px 10px",
    borderRadius: "999px",
    background: "#fff7ed",
    color: "#c2410c",
    fontWeight: "950",
    fontSize: "12px",
  },
  statusDone: {
    display: "inline-block",
    padding: "7px 10px",
    borderRadius: "999px",
    background: "#dcfce7",
    color: "#15803d",
    fontWeight: "950",
    fontSize: "12px",
  },
  mintButton: {
    padding: "8px 11px",
    border: "none",
    borderRadius: "10px",
    background: "#2081e2",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "950",
    fontSize: "12px",
  },
};

export default StudentDashboard;