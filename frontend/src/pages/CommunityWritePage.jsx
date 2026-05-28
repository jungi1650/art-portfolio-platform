import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCommunityPostApi } from "../api/community";
import { getToken } from "../utils/auth";

function CommunityWritePage({ boardType = "community" }) {
  const navigate = useNavigate();

  const isMentoring = boardType === "mentoring";

  const categoryOptions = isMentoring
    ? ["진로상담", "작품피드백", "멘토링", "멘토후기", "Q&A"]
    : ["작품공유", "피드백요청", "질문", "입시정보", "자유"];

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(categoryOptions[0]);
  const [image, setImage] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pageTitle = isMentoring ? "멘토링 글쓰기" : "커뮤니티 글쓰기";

  const pageDesc = isMentoring
    ? "멘토가 학생에게 제공할 작품 피드백과 진로 상담 내용을 작성해보세요."
    : "작품 공유, 질문, 입시 정보와 자유로운 이야기를 작성해보세요.";

  const boardLabel = isMentoring
    ? "멘토 중심 피드백 · 진로상담 공간"
    : "학생 · 학부모 · 멘토 통합 커뮤니티";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim() || !content.trim()) {
      setErrorMsg("제목과 내용을 입력해주세요.");
      return;
    }

    try {
      setSubmitting(true);

      const token = getToken();

      if (!token) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      await createCommunityPostApi(token, {
        title: title.trim(),
        content: content.trim(),
        category,
        boardType,
        image,
      });

      alert("게시글 작성 성공");
      navigate(isMentoring ? "/mentoring" : "/community");
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <main style={styles.container}>
        <section style={styles.header}>
          <p style={styles.badge}>{isMentoring ? "MENTORING" : "COMMUNITY"}</p>
          <h1 style={styles.title}>{pageTitle}</h1>
          <p style={styles.subtitle}>{pageDesc}</p>
        </section>

        <section style={styles.card}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div>
              <label style={styles.label}>
                {isMentoring ? "멘토링" : "커뮤니티"}
              </label>

              <div style={styles.boardBox}>{boardLabel}</div>
            </div>

            <div>
              <label style={styles.label}>카테고리</label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={styles.input}
              >
                {categoryOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={styles.label}>제목</label>

              <input
                type="text"
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>내용</label>

              <textarea
                placeholder="내용을 입력하세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={styles.textarea}
              />
            </div>

            <div>
              <label style={styles.label}>이미지 첨부 선택</label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                style={styles.fileInput}
              />

              {image && (
                <p style={styles.fileName}>선택된 파일: {image.name}</p>
              )}
            </div>

            {errorMsg && <p style={styles.error}>{errorMsg}</p>}

            <div style={styles.actions}>
              <button
                type="button"
                onClick={() => navigate(isMentoring ? "/mentoring" : "/community")}
                style={styles.cancelButton}
              >
                취소
              </button>

              <button
                type="submit"
                style={styles.submitButton}
                disabled={submitting}
              >
                {submitting ? "등록 중..." : "등록하기"}
              </button>
            </div>
          </form>
        </section>
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

  container: {
    maxWidth: "980px",
    margin: "0 auto",
    padding: "56px 48px 80px",
  },

  header: {
    marginBottom: "24px",
  },

  badge: {
    display: "inline-block",
    margin: 0,
    marginBottom: "12px",
    padding: "7px 12px",
    borderRadius: "999px",
    background: "#e8f3ff",
    color: "#2081e2",
    fontSize: "12px",
    fontWeight: "900",
    letterSpacing: "1px",
  },

  title: {
    margin: 0,
    fontSize: "42px",
    fontWeight: "950",
    letterSpacing: "-0.8px",
  },

  subtitle: {
    marginTop: "12px",
    color: "#64748b",
    fontSize: "16px",
    lineHeight: 1.6,
  },

  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "20px",
    padding: "28px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    color: "#334155",
    fontSize: "14px",
    fontWeight: "900",
  },

  boardBox: {
    padding: "14px 16px",
    borderRadius: "13px",
    border: "1px solid #dbeafe",
    background: "#e8f3ff",
    color: "#2081e2",
    fontWeight: "900",
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "13px",
    border: "1px solid #dbe3ef",
    color: "#0f172a",
    background: "#fff",
    outline: "none",
  },

  textarea: {
    width: "100%",
    minHeight: "320px",
    padding: "14px 16px",
    borderRadius: "13px",
    border: "1px solid #dbe3ef",
    color: "#0f172a",
    background: "#fff",
    resize: "vertical",
    outline: "none",
    lineHeight: 1.7,
  },

  fileInput: {
    width: "100%",
    padding: "12px",
    borderRadius: "13px",
    border: "1px solid #dbe3ef",
    background: "#fff",
  },

  fileName: {
    marginTop: "8px",
    marginBottom: 0,
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "700",
  },

  error: {
    color: "#dc2626",
    fontSize: "14px",
    margin: 0,
    fontWeight: "800",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    paddingTop: "8px",
  },

  cancelButton: {
    padding: "12px 16px",
    borderRadius: "13px",
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#334155",
    cursor: "pointer",
    fontWeight: "900",
  },

  submitButton: {
    padding: "12px 18px",
    borderRadius: "13px",
    border: "none",
    background: "#2081e2",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "900",
  },
};

export default CommunityWritePage;