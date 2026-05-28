import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCommunityPostsApi } from "../api/community";
import { getMeApi } from "../api/user";
import { getToken } from "../utils/auth";

function CommunityListPage({ boardType = "community" }) {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const isMentoring = boardType === "mentoring";

  const categories = isMentoring
  ? ["전체", "진로상담", "작품피드백", "포트폴리오", "멘토후기", "Q&A"]
  : ["전체", "작품공유", "피드백요청", "질문", "입시정보", "자유"];

  const pageTitle = isMentoring ? "멘토링" : "커뮤니티";

  const pageDesc = isMentoring
    ? "학생은 상담과 피드백을 요청하고, 멘토는 작품 방향성과 진로에 대한 조언을 제공하는 공간입니다."
    : "학생, 학부모, 멘토가 자유롭게 소통하는 커뮤니티입니다.";

  const canWrite = !!user;
  const writePath = isMentoring ? "/mentoring/write" : "/community/write";

  const getAuthorName = (post) => {
    return (
      post.authorName ||
      post.user?.studentProfile?.studentName ||
      post.user?.email ||
      "익명"
    );
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    return `${import.meta.env.VITE_API_BASE_URL}${imageUrl}`;
  };

  const getRoleLabel = (role) => {
    if (role === "student") return "학생";
    if (role === "parent") return "학부모";
    if (role === "mentor") return "멘토";
    return "사용자";
  };

  const getRoleStyle = (role) => {
    if (role === "student") return styles.studentRole;
    if (role === "parent") return styles.parentRole;
    if (role === "mentor") return styles.mentorRole;
    return styles.defaultRole;
  };

  const fetchData = async () => {
    try {
      const token = getToken();

      if (token) {
        try {
          const me = await getMeApi(token);
          setUser(me.user);
        } catch {
          setUser(null);
        }
      }

      const data = await getCommunityPostsApi(token, boardType);
      setPosts(data.posts || []);
    } catch (error) {
      console.error(error);
      alert(error.message || "게시글을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedCategory("전체");
    setSearch("");
    setLoading(true);
    fetchData();
  }, [boardType]);

  const filteredPosts = posts.filter((post) => {
    const matchCategory =
      selectedCategory === "전체" || post.category === selectedCategory;

    const keyword = search.trim().toLowerCase();

    const matchSearch =
      !keyword ||
      post.title?.toLowerCase().includes(keyword) ||
      post.content?.toLowerCase().includes(keyword) ||
      post.user?.email?.toLowerCase().includes(keyword) ||
      getAuthorName(post).toLowerCase().includes(keyword);

    return matchCategory && matchSearch;
  });

  if (loading) {
    return <div style={styles.loading}>게시글 불러오는 중...</div>;
  }

  return (
    <div style={styles.wrapper}>
      <main style={styles.container}>
        <section style={styles.heroCard}>
          <div>
            <p style={styles.badge}>{isMentoring ? "MENTORING" : "COMMUNITY"}</p>
            <h1 style={styles.title}>{pageTitle}</h1>
            <p style={styles.subtitle}>{pageDesc}</p>

            <div style={styles.statRow}>
              <span style={styles.statPill}>전체 {posts.length}개</span>
              <span style={styles.statPill}>
                카테고리 {categories.length - 1}개
              </span>
            </div>
          </div>

          <div style={styles.heroActions}>
            {user ? (
              <Link to={writePath} style={styles.writeButton}>
            {isMentoring
              ? user.role === "mentor"
                ? "멘토링 글쓰기"
                : "상담 요청하기"
              : "글쓰기"}
            </Link>
          ) : (
          <Link to="/login" style={styles.loginButton}>
            로그인 후 이용 가능
          </Link>
            )}
          </div>
        </section>

        <section style={styles.content}>
          <aside style={styles.sidebar}>
            <div style={styles.sideTop}>
              <div style={styles.sideIcon}>{isMentoring ? "M" : "C"}</div>
              <div>
                <h3 style={styles.sideTitle}>카테고리</h3>
                <p style={styles.sideDesc}>게시글 유형별로 모아보기</p>
              </div>
            </div>

            <div style={styles.categoryList}>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  style={
                    selectedCategory === category
                      ? styles.activeCategoryButton
                      : styles.categoryButton
                  }
                >
                  <span>{category}</span>
                  <span style={styles.categoryCount}>
                    {category === "전체"
                      ? posts.length
                      : posts.filter((post) => post.category === category)
                          .length}
                  </span>
                </button>
              ))}
            </div>

            <div style={styles.noticeBox}>
              <strong>{isMentoring ? "멘토링 안내" : "커뮤니티 안내"}</strong>
              <p>
                {isMentoring
                  ? "작품 피드백, 포트폴리오 상담, 진로 조언 등 다양한 멘토링 활동이 이루어지는 공간입니다."
                  : "학생, 학부모, 멘토가 자유롭게 소통하는 공간입니다."}
              </p>
            </div>
          </aside>

          <main style={styles.main}>
            <div style={styles.listHeader}>
              <div>
                <p style={styles.sectionBadge}>
                  {selectedCategory === "전체" ? "ALL POSTS" : selectedCategory}
                </p>
                <h2 style={styles.sectionTitle}>
                  {selectedCategory === "전체"
                    ? "전체 게시글"
                    : `${selectedCategory} 게시글`}
                </h2>
                <p style={styles.countText}>총 {filteredPosts.length}개</p>
              </div>

              <div style={styles.searchBox}>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="제목, 내용, 작성자 검색"
                  style={styles.searchInput}
                />
              </div>
            </div>

            <div style={styles.list}>
              {filteredPosts.length === 0 ? (
                <div style={styles.emptyBox}>
                  <div style={styles.emptyIcon}>✦</div>
                  <h3 style={styles.emptyTitle}>아직 게시글이 없습니다.</h3>
                  <p style={styles.emptyText}>
                    첫 번째 글을 작성하고 공간을 시작해보세요.
                  </p>

                  {canWrite ? (
                    <Link to={writePath} style={styles.emptyButton}>
                    {isMentoring
                      ? user?.role === "mentor"
                      ? "멘토링 글쓰기"
                      : "상담 요청하기"
                    : "첫 글 작성하기"}
                  </Link>
                  ) : (
                    <Link to="/login" style={styles.emptyButton}>
                      로그인하기
                    </Link>
                  )}
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <article
                    key={post.id}
                    style={styles.postCard}
                    onClick={() =>
                      navigate(
                        isMentoring
                          ? `/mentoring/${post.id}`
                          : `/community/${post.id}`
                      )
                    }
                  >
                    <div style={styles.contentRow}>
                      <div style={styles.leftContent}>
                        <div style={styles.postTop}>
                          <div style={styles.postBadges}>
                            <span style={styles.category}>{post.category}</span>
                            <span
                              style={{
                                ...styles.roleBadge,
                                ...getRoleStyle(post.user?.role),
                              }}
                            >
                              {getRoleLabel(post.user?.role)}
                            </span>
                          </div>
                        </div>

                        <h3 style={styles.postTitle}>{post.title}</h3>

                        <p style={styles.previewText}>
                          {post.content || "내용 미리보기가 없습니다."}
                        </p>
                      </div>

                      <div style={styles.rightContent}>
                        <span style={styles.dateText}>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>

                        {post.imageUrl && (
                          <img
                            src={getImageUrl(post.imageUrl)}
                            alt={post.title}
                            style={styles.postImage}
                          />
                        )}
                      </div>
                    </div>

                    <div style={styles.postFooter}>
                      <span style={styles.author}>
                        작성자 {getAuthorName(post)}
                      </span>

                      <span style={styles.readMore}>
                        댓글 {post.commentCount || 0}개 · 자세히 보기 →
                      </span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </main>
        </section>
      </main>
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
    background: "#f1f5f9",
    color: "#334155",
  },
  container: {
    maxWidth: "1500px",
    margin: "0 auto",
    padding: "44px 52px 76px",
  },
  heroCard: {
    background: "rgba(255,255,255,0.9)",
    borderRadius: "24px",
    padding: "30px",
    border: "1px solid rgba(226,232,240,0.95)",
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.10)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "28px",
    marginBottom: "28px",
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
  statRow: {
    marginTop: "18px",
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  statPill: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "#f1f7ff",
    color: "#1d4ed8",
    fontSize: "12px",
    fontWeight: "900",
  },
  heroActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  writeButton: {
    padding: "14px 20px",
    borderRadius: "15px",
    background: "#2081e2",
    color: "#fff",
    textDecoration: "none",
    fontWeight: "950",
    boxShadow: "0 12px 24px rgba(32,129,226,0.25)",
  },
  loginButton: {
    padding: "14px 20px",
    borderRadius: "15px",
    background: "#ffffff",
    color: "#2081e2",
    border: "1px solid #bfdbfe",
    textDecoration: "none",
    fontWeight: "950",
  },
  disabledButton: {
    padding: "14px 20px",
    borderRadius: "15px",
    background: "#f1f5f9",
    color: "#64748b",
    border: "1px solid #e5e7eb",
    fontWeight: "950",
  },
  content: {
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: "26px",
  },
  sidebar: {
    background: "rgba(255,255,255,0.9)",
    borderRadius: "22px",
    border: "1px solid rgba(226,232,240,0.95)",
    padding: "22px",
    height: "fit-content",
    position: "sticky",
    top: "92px",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
  },
  sideTop: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "18px",
  },
  sideIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    background: "#e8f3ff",
    color: "#2081e2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "950",
  },
  sideTitle: {
    margin: 0,
    fontSize: "19px",
    fontWeight: "950",
  },
  sideDesc: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },
  categoryList: {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
  },
  categoryButton: {
    width: "100%",
    padding: "12px 13px",
    border: "none",
    borderRadius: "14px",
    background: "#f8fafc",
    color: "#334155",
    textAlign: "left",
    cursor: "pointer",
    fontWeight: "850",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activeCategoryButton: {
    width: "100%",
    padding: "12px 13px",
    border: "none",
    borderRadius: "14px",
    background: "#2081e2",
    color: "#ffffff",
    textAlign: "left",
    cursor: "pointer",
    fontWeight: "950",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 10px 20px rgba(32,129,226,0.22)",
  },
  categoryCount: {
    opacity: 0.8,
    fontSize: "12px",
    fontWeight: "950",
  },
  noticeBox: {
    marginTop: "20px",
    padding: "16px",
    borderRadius: "16px",
    background: "#f1f7ff",
    color: "#475569",
    fontSize: "13px",
    lineHeight: 1.6,
  },
  main: {
    minWidth: 0,
  },
  listHeader: {
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(226,232,240,0.95)",
    borderRadius: "22px",
    padding: "24px",
    marginBottom: "18px",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
    display: "flex",
    justifyContent: "space-between",
    gap: "18px",
    alignItems: "center",
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
    fontSize: "25px",
    fontWeight: "950",
  },
  countText: {
    marginTop: "7px",
    color: "#64748b",
    fontSize: "14px",
  },
  searchBox: {
    minWidth: "320px",
  },
  searchInput: {
    width: "100%",
    padding: "13px 15px",
    borderRadius: "15px",
    border: "1px solid #dbe3ef",
    background: "#f8fafc",
    color: "#0f172a",
    outline: "none",
    fontSize: "14px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  emptyBox: {
    background: "rgba(255,255,255,0.9)",
    borderRadius: "22px",
    padding: "52px",
    textAlign: "center",
    color: "#64748b",
    border: "1px dashed #bfdbfe",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.06)",
  },
  emptyIcon: {
    width: "54px",
    height: "54px",
    borderRadius: "18px",
    background: "#e8f3ff",
    color: "#2081e2",
    margin: "0 auto 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "950",
  },
  emptyTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "22px",
    fontWeight: "950",
  },
  emptyText: {
    margin: "10px 0 20px",
    color: "#64748b",
  },
  emptyButton: {
    display: "inline-flex",
    padding: "13px 18px",
    borderRadius: "15px",
    background: "#2081e2",
    color: "#fff",
    textDecoration: "none",
    fontWeight: "950",
  },
  postCard: {
    background: "#fff",
    borderRadius: "24px",
    padding: "26px",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "20px",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
  },
  contentRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "32px",
  },
  leftContent: {
    flex: 1,
    minWidth: 0,
    paddingTop: "4px",
  },
  rightContent: {
    width: "260px",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "18px",
  },
  postImage: {
    width: "220px",
    height: "220px",
    objectFit: "cover",
    borderRadius: "18px",
    background: "#f8fafc",
    display: "block",
  },
  postTop: {
    display: "flex",
    alignItems: "center",
    marginBottom: "18px",
  },
  postBadges: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  category: {
    display: "inline-block",
    padding: "7px 11px",
    borderRadius: "999px",
    background: "#e8f3ff",
    color: "#2081e2",
    fontSize: "12px",
    fontWeight: "950",
  },
  roleBadge: {
    display: "inline-block",
    padding: "7px 11px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "950",
  },
  studentRole: {
    background: "#dbeafe",
    color: "#1d4ed8",
  },
  parentRole: {
    background: "#dcfce7",
    color: "#15803d",
  },
  mentorRole: {
    background: "#f3e8ff",
    color: "#7e22ce",
  },
  defaultRole: {
    background: "#f1f5f9",
    color: "#475569",
  },
  dateText: {
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },
  postTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "950",
    color: "#0f172a",
  },
  previewText: {
    marginTop: "10px",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.65,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  postFooter: {
    paddingTop: "18px",
    borderTop: "1px solid #edf2f7",
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "800",
  },
  author: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  readMore: {
    color: "#2081e2",
    fontWeight: "950",
    whiteSpace: "nowrap",
  },
};

export default CommunityListPage;