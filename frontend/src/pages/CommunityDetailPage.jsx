import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCommunityPostDetailApi,
  deleteCommunityPostApi,
  createCommunityCommentApi,
} from "../api/community";
import { getMeApi } from "../api/user";
import { getToken } from "../utils/auth";

function CommunityDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [post, setPost] = useState(null);
  const [me, setMe] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);

  const fetchData = async () => {
    try {
      const token = getToken();

      if (token) {
        try {
          const meData = await getMeApi(token);
          setMe(meData.user);
        } catch {
          setMe(null);
        }
      }

      const postData = await getCommunityPostDetailApi(token, id);
      setPost(postData.post);
    } catch (error) {
      alert(error.message || "게시글을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const isMentoring = post?.boardType === "mentoring";
  const listPath = isMentoring ? "/mentoring" : "/community";
  const writePath = isMentoring ? "/mentoring/write" : "/community/write";
  const boardLabel = isMentoring ? "멘토링" : "커뮤니티";

  const authorName =
    post?.authorName ||
    post?.user?.studentProfile?.studentName ||
    post?.user?.email ||
    "익명";

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      const token = getToken();

      if (!token) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      await deleteCommunityPostApi(token, id);
      alert("삭제 완료");
      navigate(listPath);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCreateComment = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      setCommenting(true);

      const token = getToken();

      if (!token) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      await createCommunityCommentApi(token, id, comment.trim());

      setComment("");
      await fetchData();
    } catch (error) {
      alert(error.message);
    } finally {
      setCommenting(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>게시글 불러오는 중...</div>;
  }

  if (!post) {
    return <div style={styles.loading}>게시글이 없습니다.</div>;
  }

  const isAuthor = me?.id === post.user?.id;

  return (
    <div style={styles.wrapper}>
      <main style={styles.container}>
        <div>
          <section style={styles.articleCard}>
            <div style={styles.topRow}>
              <div style={styles.badgeRow}>
                <span style={styles.boardBadge}>{boardLabel}</span>
                <span style={styles.category}>{post.category}</span>
              </div>

              <span style={styles.dateText}>
                {new Date(post.createdAt).toLocaleString()}
              </span>
            </div>

            <h1 style={styles.title}>{post.title}</h1>

            <div style={styles.authorBox}>
              <div style={styles.avatar}>
                {authorName.slice(0, 1).toUpperCase()}
              </div>

              <div>
                <p style={styles.authorLabel}>작성자</p>
                <p style={styles.authorEmail}>{authorName}</p>
              </div>
            </div>

            {post.imageUrl && (
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}${post.imageUrl}`}
                alt={post.title}
                style={styles.postImage}
              />
            )}

            <div style={styles.divider} />

            <article style={styles.content}>{post.content}</article>

            <div style={styles.actions}>
              <button onClick={() => navigate(listPath)} style={styles.backButton}>
                목록으로
              </button>

              {isAuthor && (
                <button onClick={handleDelete} style={styles.deleteButton}>
                  삭제
                </button>
              )}
            </div>
          </section>

          <section style={styles.commentCard}>
            <div style={styles.commentHeader}>
              <h2 style={styles.commentTitle}>
                댓글 {post.comments?.length || 0}개
              </h2>
            </div>

            {post.comments?.length > 0 ? (
              <div style={styles.commentList}>
                {post.comments.map((item) => (
                  <div key={item.id} style={styles.commentItem}>
                    <div style={styles.commentMeta}>
                      <strong>
                        {item.authorName ||
                          item.user?.studentProfile?.studentName ||
                          item.user?.email ||
                          "익명"}
                      </strong>
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                    <p style={styles.commentText}>{item.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyComment}>아직 댓글이 없습니다.</div>
            )}

            <form onSubmit={handleCreateComment} style={styles.commentForm}>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="댓글을 입력하세요"
                style={styles.commentInput}
              />

              <button
                type="submit"
                style={styles.commentButton}
                disabled={commenting}
              >
                {commenting ? "작성 중..." : "댓글 작성"}
              </button>
            </form>
          </section>
        </div>

        <aside style={styles.sideCard}>
          <p style={styles.sideBadge}>
            {isMentoring ? "MENTORING" : "COMMUNITY"}
          </p>

          <h3 style={styles.sideTitle}>{boardLabel}</h3>

          <p style={styles.sideText}>
            {isMentoring
              ? "멘토가 작품 피드백과 진로 상담을 제공하는 공간입니다."
              : "학생, 학부모, 멘토가 자유롭게 소통하는 공간입니다."}
          </p>

          <button onClick={() => navigate(listPath)} style={styles.sideButton}>
            게시글 목록 보기
          </button>

          <button onClick={() => navigate(writePath)} style={styles.writeButton}>
            새 글 작성
          </button>
        </aside>
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "#f8fbff",
    color: "#0f172a",
  },

  loading: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f8fbff",
    color: "#334155",
  },

  container: {
    maxWidth: "1500px",
    margin: "0 auto",
    padding: "48px",
    display: "grid",
    gridTemplateColumns: "1fr 320px",
    gap: "24px",
    alignItems: "start",
  },

  articleCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "20px",
    padding: "32px",
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "center",
    marginBottom: "18px",
  },

  badgeRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  boardBadge: {
    display: "inline-block",
    padding: "7px 11px",
    borderRadius: "999px",
    background: "#f1f5f9",
    color: "#334155",
    fontSize: "12px",
    fontWeight: "900",
  },

  category: {
    display: "inline-block",
    padding: "7px 11px",
    borderRadius: "999px",
    background: "#e8f3ff",
    color: "#2081e2",
    fontSize: "12px",
    fontWeight: "900",
  },

  dateText: {
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  title: {
    margin: 0,
    fontSize: "38px",
    fontWeight: "950",
    letterSpacing: "-0.8px",
    lineHeight: 1.25,
  },

  authorBox: {
    marginTop: "22px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  avatar: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    background: "#2081e2",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "950",
  },

  authorLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "800",
  },

  authorEmail: {
    margin: "3px 0 0",
    color: "#0f172a",
    fontWeight: "900",
  },

  postImage: {
  width: "100%",
  maxHeight: "620px",
  objectFit: "contain",
  borderRadius: "18px",
  marginTop: "26px",
  display: "block",
  background: "#f8fafc",
  border: "1px solid #eef2f7",
  },

  divider: {
    height: "1px",
    background: "#f1f5f9",
    margin: "28px 0",
  },

  content: {
    minHeight: "220px",
    lineHeight: 1.9,
    fontSize: "16px",
    color: "#334155",
    whiteSpace: "pre-wrap",
  },

  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "32px",
  },

  backButton: {
    padding: "12px 16px",
    borderRadius: "13px",
    border: "none",
    background: "#0f172a",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "900",
  },

  deleteButton: {
    padding: "12px 16px",
    borderRadius: "13px",
    border: "none",
    background: "#ef4444",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "900",
  },

  commentCard: {
    marginTop: "20px",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "20px",
    padding: "26px",
  },

  commentHeader: {
    marginBottom: "18px",
  },

  commentTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "950",
  },

  commentList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "20px",
  },

  commentItem: {
    padding: "16px",
    borderRadius: "15px",
    background: "#f8fafc",
    border: "1px solid #eef2f7",
  },

  commentMeta: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    color: "#64748b",
    fontSize: "13px",
    marginBottom: "8px",
  },

  commentText: {
    margin: 0,
    color: "#334155",
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
  },

  emptyComment: {
    padding: "18px",
    borderRadius: "15px",
    background: "#f8fafc",
    border: "1px dashed #cbd5e1",
    color: "#64748b",
    marginBottom: "18px",
  },

  commentForm: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  commentInput: {
    width: "100%",
    minHeight: "96px",
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid #dbe3ef",
    outline: "none",
    resize: "vertical",
    lineHeight: 1.6,
    boxSizing: "border-box",
  },

  commentButton: {
    alignSelf: "flex-end",
    padding: "12px 16px",
    borderRadius: "13px",
    border: "none",
    background: "#2081e2",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "900",
  },

  sideCard: {
    position: "sticky",
    top: "92px",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "22px",
  },

  sideBadge: {
    display: "inline-block",
    margin: "0 0 12px",
    padding: "7px 11px",
    borderRadius: "999px",
    background: "#e8f3ff",
    color: "#2081e2",
    fontSize: "11px",
    fontWeight: "900",
    letterSpacing: "0.8px",
  },

  sideTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "950",
  },

  sideText: {
    marginTop: "10px",
    color: "#64748b",
    lineHeight: 1.7,
    fontSize: "14px",
  },

  sideButton: {
    marginTop: "18px",
    width: "100%",
    padding: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "13px",
    background: "#fff",
    color: "#334155",
    cursor: "pointer",
    fontWeight: "900",
  },

  writeButton: {
    marginTop: "10px",
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "13px",
    background: "#2081e2",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "900",
  },
};

export default CommunityDetailPage;