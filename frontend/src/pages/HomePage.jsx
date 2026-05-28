import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getToken } from "../utils/auth";
import {
  getRecentPortfoliosApi,
  getCertifiedPortfoliosApi,
} from "../api/portfolio";

function HomePage() {
  const navigate = useNavigate();

  const [recentWorks, setRecentWorks] = useState([]);
  const [certifiedWorks, setCertifiedWorks] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());
  const [search, setSearch] = useState("");

  useEffect(() => {
    const syncAuth = () => setIsLoggedIn(!!getToken());

    window.addEventListener("auth-change", syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("auth-change", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [recentData, certifiedData] = await Promise.all([
          getRecentPortfoliosApi(),
          getCertifiedPortfoliosApi(),
        ]);

        setRecentWorks(recentData.portfolios || []);
        setCertifiedWorks(certifiedData.portfolios || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchHomeData();
  }, []);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    return `${import.meta.env.VITE_API_BASE_URL}${imageUrl}`;
  };

  const getStudentName = (work) => {
    return work.user?.studentProfile?.studentName || "학생 작가";
  };

  const handleSearch = (e) => {
    e.preventDefault();

    const keyword = search.trim();

    if (keyword) {
      navigate(`/artworks?search=${encodeURIComponent(keyword)}`);
    } else {
      navigate("/artworks");
    }
  };

  const categories = [
    "전체",
    "드로잉",
    "일러스트",
    "디자인",
    "회화",
    "포스터",
    "3D/모델링",
    "기타",
  ];

  const WorkCard = ({ work }) => (
    <article
      style={styles.workCard}
      onClick={() => navigate(`/portfolio/${work.id}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 20px 44px rgba(15,23,42,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 10px 24px rgba(15,23,42,0.06)";
      }}
    >
      <div style={styles.imageBox}>
        <img
          src={getImageUrl(work.imageUrl)}
          alt={work.title}
          style={styles.workImage}
        />

        {work.isMinted && <span style={styles.nftBadge}>NFT 인증</span>}
      </div>

      <div style={styles.workInfo}>
        <h3 style={styles.workTitle}>{work.title}</h3>

        <p style={styles.workDesc}>
          {work.description || "작품 설명이 없습니다."}
        </p>

        <div style={styles.workMeta}>
          <span>{getStudentName(work)}</span>
          <span>{work.category || "기타"}</span>
        </div>
      </div>
    </article>
  );

  return (
    <div style={styles.wrapper}>
      <main style={styles.container}>
        <section style={styles.heroCard}>
          <div style={styles.heroLeft}>
            <p style={styles.heroBadge}>STUDENT ART PORTFOLIO</p>

            <h1 style={styles.heroTitle}>
              학생 작품을 기록하고,
              <br />
              NFT로 인증하세요.
            </h1>

            <p style={styles.heroDesc}>
              학생 창작물을 안전하게 보관하고
              <br />
              블록체인 기반으로 원본성을 인증하는 디지털 포트폴리오 플랫폼
            </p>

            <form onSubmit={handleSearch} style={styles.searchBar}>
              <span style={styles.searchIcon}>⌕</span>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="작품 · 작가 검색"
                style={styles.searchInput}
              />

              <button type="submit" style={styles.searchButton}>
                검색
              </button>
            </form>

            <div style={styles.heroActions}>
              {isLoggedIn ? (
                <Link to="/student" style={styles.primaryBtn}>
                  내 포트폴리오
                </Link>
              ) : (
                <Link to="/login" style={styles.primaryBtn}>
                  시작하기
                </Link>
              )}

              <Link to="/artworks" style={styles.secondaryBtn}>
                작품 둘러보기
              </Link>

            </div>
          </div>

          <div style={styles.heroRight}>
  <div style={styles.previewCard}>
    <div style={styles.previewImage}>
      <span style={styles.previewImageBadge}>
        NFT 인증
      </span>

      <div style={styles.previewLogo}>
        Stufolio
      </div>
    </div>

    <div style={styles.previewBody}>
      <p style={styles.previewCategory}>
        DIGITAL PORTFOLIO
      </p>

      <h3 style={styles.previewTitle}>
        학생 작품 #01
      </h3>

      <div style={styles.previewMeta}>
        <span>by Name</span>
        <span>Token #01</span>
      </div>
    </div>
  </div>
</div>
        </section>

        

        <PreviewSection
          badge="NEW ARTWORKS"
          title="최근 등록 작품"
          desc="새롭게 업로드된 학생 작품을 확인해보세요."
          works={recentWorks}
          emptyText="아직 등록된 작품이 없습니다."
          WorkCard={WorkCard}
        />

        <PreviewSection
          badge="CERTIFIED WORKS"
          title="NFT 인증 작품"
          desc="블록체인에 인증 이력이 등록된 작품입니다."
          works={certifiedWorks}
          emptyText="아직 NFT 인증 작품이 없습니다."
          WorkCard={WorkCard}
        />

        <section style={styles.certSection}>
          <div>
            <p style={styles.sectionBadge}>NFT CERTIFICATION</p>
            <h2 style={styles.certTitle}>작품 등록 이력을 NFT로 인증</h2>
            <p style={styles.certDesc}>
              작품 이미지는 IPFS에 저장하고, metadata URI를 기반으로 ERC-721
              NFT를 발행합니다. 사용자는 트랜잭션 해시와 컨트랙트 주소를 통해
              작품의 등록 이력을 검증할 수 있습니다.
            </p>
          </div>

          <div style={styles.certCards}>
            <div style={styles.certCard}>
              <strong>01</strong>
              <span>작품 업로드</span>
            </div>

            <div style={styles.certCard}>
              <strong>02</strong>
              <span>IPFS 저장</span>
            </div>

            <div style={styles.certCard}>
              <strong>03</strong>
              <span>NFT 인증</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function PreviewSection({ badge, title, desc, works, emptyText, WorkCard }) {
  return (
    <section style={styles.previewSection}>
      <div style={styles.sectionHeader}>
        <div>
          <p style={styles.sectionBadge}>{badge}</p>
          <h2 style={styles.sectionTitle}>{title}</h2>
        </div>

        <p style={styles.sectionDesc}>{desc}</p>
      </div>

      {works.length > 0 ? (
        <div style={styles.grid}>
          {works.slice(0, 8).map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>
      ) : (
        <div style={styles.emptyBox}>{emptyText}</div>
      )}
    </section>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #f6f9ff 0%, #ffffff 34%, #f8fafc 100%)",
    color: "#0f172a",
  },

  container: {
    maxWidth: "1680px",
    margin: "0 auto",
    padding: "48px 56px 90px",
  },

  heroCard: {
    background: "#ffffff",
    borderRadius: "32px",
    padding: "54px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 24px 64px rgba(15, 23, 42, 0.08)",
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: "54px",
    alignItems: "center",
    marginBottom: "34px",
  },

  heroLeft: {
    minWidth: 0,
  },

  heroRight: {
    display: "flex",
    justifyContent: "center",
  },

  heroBadge: {
    display: "inline-flex",
    margin: 0,
    marginBottom: "18px",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "950",
    letterSpacing: "1.2px",
  },

  heroTitle: {
    margin: 0,
    fontSize: "60px",
    lineHeight: 1.08,
    fontWeight: "950",
    letterSpacing: "-2px",
    color: "#0f172a",
  },

  heroDesc: {
    maxWidth: "780px",
    margin: "22px 0 0",
    color: "#475569",
    fontSize: "17px",
    lineHeight: 1.8,
  },

  searchBar: {
    width: "100%",
    maxWidth: "660px",
    height: "54px",
    marginTop: "34px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 10px 0 18px",
    background: "#f8fafc",
    border: "1px solid #dbe3ef",
    borderRadius: "999px",
  },

  searchIcon: {
    color: "#64748b",
    fontWeight: "950",
    fontSize: "20px",
  },

  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "15px",
    color: "#0f172a",
    fontWeight: "700",
  },

  searchButton: {
    height: "38px",
    padding: "0 18px",
    borderRadius: "999px",
    border: "none",
    background: "#0f172a",
    color: "#ffffff",
    fontWeight: "900",
    cursor: "pointer",
  },

  heroActions: {
    marginTop: "24px",
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  primaryBtn: {
    padding: "13px 20px",
    borderRadius: "14px",
    background: "#2563eb",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: "950",
    boxShadow: "0 10px 20px rgba(37,99,235,0.2)",
  },

  secondaryBtn: {
    padding: "13px 20px",
    borderRadius: "14px",
    background: "#ffffff",
    color: "#2563eb",
    border: "1px solid #bfdbfe",
    textDecoration: "none",
    fontWeight: "950",
  },

  ghostBtn: {
    padding: "13px 20px",
    borderRadius: "14px",
    background: "#ffffff",
    color: "#334155",
    border: "1px solid #e5e7eb",
    textDecoration: "none",
    fontWeight: "950",
  },

  previewCard: {
  width: "320px",
  borderRadius: "30px",
  overflow: "hidden",
  background: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(18px)",
  border: "1px solid rgba(255,255,255,0.45)",
  boxShadow: "0 28px 70px rgba(15,23,42,0.12)",
  },

  previewImage: {
  height: "320px",
  background:
    "linear-gradient(135deg, #c7dcff 0%, #e8c8ff 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  },

  previewLogo: {
    color: "#ffffff",
    fontSize: "32px",
    fontWeight: "950",
    letterSpacing: "-1px",
  },

  previewBody: {
    padding: "20px",
  },

  previewBadge: {
  display: "inline-flex",
  padding: "7px 12px",
  borderRadius: "999px",
  background: "#eef4ff",
  color: "#2563eb",
  fontSize: "11px",
  fontWeight: "800",
  marginBottom: "12px",
},

  previewTitle: {
    margin: 0,
    fontSize: "19px",
    fontWeight: "950",
  },

  previewText: {
    marginTop: "8px",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  categorySection: {
    marginTop: "34px",
    padding: "28px 30px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "24px",
    boxShadow: "0 14px 34px rgba(15,23,42,0.05)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "24px",
    flexWrap: "wrap",
  },

  categoryHeader: {
    flexShrink: 0,
  },

  categoryList: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  categoryButton: {
    padding: "11px 15px",
    borderRadius: "999px",
    border: "1px solid #e5e7eb",
    background: "#f8fafc",
    color: "#334155",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "900",
  },

  previewSection: {
    marginTop: "46px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "24px",
    gap: "20px",
  },

  sectionBadge: {
    margin: "0 0 8px",
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "950",
    letterSpacing: "1px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "34px",
    fontWeight: "950",
    letterSpacing: "-1px",
  },

  sectionDesc: {
    maxWidth: "560px",
    margin: 0,
    color: "#64748b",
    fontSize: "15px",
    lineHeight: 1.6,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "24px",
  },

  workCard: {
    background: "#ffffff",
    borderRadius: "18px",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    transition: "0.18s ease",
    boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
  },

  imageBox: {
    position: "relative",
    aspectRatio: "4 / 3",
    background: "#f1f5f9",
    overflow: "hidden",
  },

  workImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  nftBadge: {
  position: "absolute",
  top: "12px",
  left: "12px",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "rgba(32,129,226,0.95)",
  color: "#ffffff",
  fontSize: "11px",
  fontWeight: "950",
  boxShadow: "0 6px 14px rgba(32,129,226,0.28)",
  border: "1px solid rgba(255,255,255,0.18)",
},

  workInfo: {
    padding: "15px 16px 16px",
  },

  workTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "950",
  },

  workDesc: {
    marginTop: "8px",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.5,
    minHeight: "38px",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  workMeta: {
    marginTop: "13px",
    paddingTop: "12px",
    borderTop: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "800",
  },

  emptyBox: {
    padding: "46px",
    background: "#ffffff",
    border: "1px dashed #cbd5e1",
    borderRadius: "20px",
    textAlign: "center",
    color: "#64748b",
  },

  certSection: {
    marginTop: "70px",
    padding: "38px",
    borderRadius: "26px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    boxShadow: "0 16px 38px rgba(15,23,42,0.05)",
    display: "flex",
    justifyContent: "space-between",
    gap: "32px",
    alignItems: "center",
  },

  certTitle: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "950",
    letterSpacing: "-1px",
  },

  certDesc: {
    marginTop: "12px",
    maxWidth: "760px",
    color: "#64748b",
    lineHeight: 1.7,
  },

  certCards: {
    display: "flex",
    gap: "12px",
    flexShrink: 0,
  },

  certCard: {
    width: "120px",
    height: "104px",
    borderRadius: "20px",
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    color: "#334155",
    fontWeight: "900",
  },
  previewLogo: {
  fontSize: "42px",
  fontWeight: "900",
  color: "rgba(255,255,255,0.92)",
  letterSpacing: "-1px",
  },


heroRight: {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
},

previewCard: {
  width: "320px",
  borderRadius: "30px",
  overflow: "hidden",
  background: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(18px)",
  border: "1px solid rgba(255,255,255,0.45)",
  boxShadow: "0 28px 70px rgba(15,23,42,0.12)",
},

previewImage: {
  height: "320px",
  background:
    "linear-gradient(135deg, #c7dcff 0%, #e8c8ff 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
},

previewImageBadge: {
  position: "absolute",
  top: "18px",
  left: "18px",
  padding: "7px 12px",
  borderRadius: "999px",
  background: "#2563eb",
  color: "#fff",
  fontSize: "11px",
  fontWeight: "800",
  boxShadow: "0 4px 12px rgba(37,99,235,0.28)",
},

previewLogo: {
  fontSize: "30px",
  fontWeight: "900",
  color: "rgba(255,255,255,0.92)",
  letterSpacing: "-1px",
  textAlign: "center",
  lineHeight: 1.2,
},

previewBody: {
  padding: "22px",
  background: "#fff",
},

previewCategory: {
  margin: 0,
  marginBottom: "10px",
  color: "#64748b",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "1px",
},

previewTitle: {
  margin: 0,
  fontSize: "22px",
  fontWeight: "900",
  color: "#0f172a",
  lineHeight: 1.25,
},

previewMeta: {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "16px",
  color: "#64748b",
  fontSize: "13px",
  fontWeight: "600",
},
};

export default HomePage;