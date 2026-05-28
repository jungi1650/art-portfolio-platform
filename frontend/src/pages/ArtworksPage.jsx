import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getPublicPortfoliosApi } from "../api/portfolio";

function ArtworksPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get("search") || "";

  const [portfolios, setPortfolios] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState("전체");
  const [minted, setMinted] = useState("all");
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);

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

  const fetchPortfolios = async () => {
    try {
      setLoading(true);

      const data = await getPublicPortfoliosApi({
        search,
        category,
        minted,
      });

      setPortfolios(data.portfolios || []);
    } catch (error) {
      console.error(error);
      alert(error.message || "작품 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, [category, minted]);

  const handleSearch = (e) => {
    e.preventDefault();

    const params = {};
    if (search.trim()) params.search = search.trim();

    setSearchParams(params);
    fetchPortfolios();
  };

  const getImageUrl = (url) => {
    if (!url) return "";
    return `${import.meta.env.VITE_API_BASE_URL}${url}`;
  };

  const getStudentName = (work) => {
    return work.user?.studentProfile?.studentName || "학생 작가";
  };

  return (
    <div style={styles.wrapper}>
      <main style={styles.container}>
        <section style={styles.heroCard}>
          <div>
            <p style={styles.badge}>ARTWORKS</p>
            <h1 style={styles.title}>작품 둘러보기</h1>
            <p style={styles.subtitle}>
              학생들이 등록한 작품을 검색하고 카테고리별로 탐색할 수 있습니다.
            </p>

            <form onSubmit={handleSearch} style={styles.searchForm}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="작품 제목, 설명, 작가 이름 검색"
                style={styles.searchInput}
              />
              <button type="submit" style={styles.searchButton}>
                검색
              </button>
            </form>
          </div>

          <div style={styles.heroStats}>
            <StatBox label="검색 결과" value={`${portfolios.length}개`} />
            <StatBox
              label="선택 카테고리"
              value={category === "전체" ? "전체" : category}
            />
            <StatBox
              label="NFT 필터"
              value={
                minted === "all"
                  ? "전체"
                  : minted === "true"
                  ? "인증"
                  : "미인증"
              }
            />
          </div>
        </section>

        <section style={styles.filterCard}>
          <div style={styles.categoryRow}>
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                style={
                  category === item ? styles.activeCategory : styles.category
                }
              >
                {item}
              </button>
            ))}
          </div>

          <select
            value={minted}
            onChange={(e) => setMinted(e.target.value)}
            style={styles.select}
          >
            <option value="all">전체 작품</option>
            <option value="true">NFT 인증 작품</option>
            <option value="false">미인증 작품</option>
          </select>
        </section>

        <section style={styles.listSection}>
          <div style={styles.sectionHeader}>
            <div>
              <p style={styles.sectionBadge}>PORTFOLIO GALLERY</p>
              <h2 style={styles.sectionTitle}>전체 작품</h2>
              <p style={styles.countText}>총 {portfolios.length}개의 작품</p>
            </div>
          </div>

          {loading ? (
            <div style={styles.emptyBox}>작품 불러오는 중...</div>
          ) : portfolios.length === 0 ? (
            <div style={styles.emptyBox}>
              <div style={styles.emptyIcon}>✦</div>
              <h3 style={styles.emptyTitle}>조건에 맞는 작품이 없습니다.</h3>
              <p style={styles.emptyText}>
                검색어를 바꾸거나 다른 카테고리를 선택해보세요.
              </p>
            </div>
          ) : (
            <div style={styles.grid}>
              {portfolios.map((work) => (
                <article
                  key={work.id}
                  style={{
                    ...styles.card,
                    ...(hoveredId === work.id ? styles.cardHover : {}),
                  }}
                  onMouseEnter={() => setHoveredId(work.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => navigate(`/portfolio/${work.id}`)}
                >
                  <div style={styles.imageBox}>
                    <img
                      src={getImageUrl(work.imageUrl)}
                      alt={work.title}
                      style={styles.image}
                    />

                    {work.isMinted && (
                      <span style={styles.nftBadge}>NFT 인증</span>
                    )}
                  </div>

                  <div style={styles.cardBody}>
                    <span style={styles.categoryBadge}>
                      {work.category || "기타"}
                    </span>

                    <h3 style={styles.cardTitle}>{work.title}</h3>

                    <p style={styles.cardDesc}>
                      {work.description || "작품 설명이 없습니다."}
                    </p>

                    <div style={styles.cardFooter}>
                      <span>{getStudentName(work)}</span>
                      <span>{new Date(work.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div style={styles.statBox}>
      <span style={styles.statLabel}>{label}</span>
      <strong style={styles.statValue}>{value}</strong>
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
  container: {
    maxWidth: "1680px",
    margin: "0 auto",
    padding: "46px 56px 82px",
  },
  heroCard: {
    background: "rgba(255,255,255,0.9)",
    borderRadius: "28px",
    padding: "38px",
    border: "1px solid rgba(226,232,240,0.95)",
    boxShadow: "0 28px 70px rgba(15, 23, 42, 0.12)",
    display: "grid",
    gridTemplateColumns: "1fr 420px",
    gap: "34px",
    alignItems: "end",
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
    lineHeight: 1.7,
  },
  searchForm: {
    marginTop: "26px",
    maxWidth: "780px",
    display: "flex",
    gap: "10px",
    background: "#ffffff",
    padding: "10px",
    borderRadius: "20px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
  },
  searchInput: {
    flex: 1,
    border: "none",
    padding: "15px 16px",
    borderRadius: "15px",
    background: "#f8fafc",
    color: "#0f172a",
    outline: "none",
    fontSize: "15px",
  },
  searchButton: {
    background: "#2081e2",
    color: "#fff",
    border: "none",
    padding: "0 24px",
    borderRadius: "15px",
    fontWeight: "950",
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(32,129,226,0.22)",
  },
  heroStats: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "12px",
  },
  statBox: {
    background: "#f8fbff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "16px",
  },
  statLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "850",
    marginBottom: "7px",
  },
  statValue: {
    color: "#0f172a",
    fontSize: "18px",
    fontWeight: "950",
  },
  filterCard: {
    background: "rgba(255,255,255,0.9)",
    borderRadius: "22px",
    padding: "20px",
    border: "1px solid rgba(226,232,240,0.95)",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "18px",
    marginBottom: "24px",
  },
  categoryRow: {
    display: "flex",
    gap: "9px",
    flexWrap: "wrap",
  },
  category: {
    padding: "10px 14px",
    borderRadius: "999px",
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#334155",
    cursor: "pointer",
    fontWeight: "850",
  },
  activeCategory: {
    padding: "10px 14px",
    borderRadius: "999px",
    border: "none",
    background: "#2081e2",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "950",
    boxShadow: "0 10px 20px rgba(32,129,226,0.22)",
  },
  select: {
    minWidth: "160px",
    padding: "11px 13px",
    borderRadius: "14px",
    border: "1px solid #dbe3ef",
    background: "#fff",
    color: "#0f172a",
    fontWeight: "850",
    outline: "none",
  },
  listSection: {
    background: "rgba(255,255,255,0.9)",
    borderRadius: "24px",
    padding: "26px",
    border: "1px solid rgba(226,232,240,0.95)",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
  },
  sectionHeader: {
    marginBottom: "22px",
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
    fontSize: "28px",
    fontWeight: "950",
  },
  countText: {
    marginTop: "7px",
    color: "#64748b",
    fontSize: "14px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "22px",
  },
  card: {
    background: "rgba(255,255,255,0.92)",
    borderRadius: "20px",
    overflow: "hidden",
    border: "1px solid rgba(226,232,240,0.95)",
    boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
    cursor: "pointer",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
  },
  cardHover: {
    transform: "translateY(-5px)",
    boxShadow: "0 22px 50px rgba(15, 23, 42, 0.14)",
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
  nftBadge: {
    position: "absolute",
    top: "12px",
    left: "12px",
    background: "rgba(32, 129, 226, 0.95)",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: "999px",
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
    marginTop: "8px",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.45,
    minHeight: "38px",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  cardFooter: {
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "800",
  },
  emptyBox: {
    background: "#f8fbff",
    borderRadius: "20px",
    padding: "52px",
    textAlign: "center",
    color: "#64748b",
    border: "1px dashed #bfdbfe",
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
    color: "#0f172a",
    fontSize: "20px",
    fontWeight: "950",
  },
  emptyText: {
    marginTop: "10px",
    color: "#64748b",
  },
};

export default ArtworksPage;