import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginApi } from "../api/auth";
import { getMeApi } from "../api/user";
import { setToken } from "../utils/auth";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      setLoading(true);

      const loginData = await loginApi(email, password);
      setToken(loginData.token);

      const me = await getMeApi(loginData.token);
      const role = me.user?.role;

      if (role === "student") {
        navigate("/student");
      } else if (role === "parent") {
        navigate("/parent");
      } else if (role === "mentor") {
        navigate("/community");
      } else {
        throw new Error("알 수 없는 사용자 권한입니다.");
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <main style={styles.container}>
        <section style={styles.leftPanel}>
          <p style={styles.badge}>STUFOLIO</p>

          <h1 style={styles.title}>
            학생 작품을
            <br />
            포트폴리오로
            <br />
            기록하고 공유하세요.
          </h1>

          <p style={styles.description}>
            작품 업로드, 포트폴리오 관리, NFT 인증과 커뮤니티 기능을 제공하는
            학생 아트 플랫폼입니다.
          </p>

          <div style={styles.infoBox}>
            <div style={styles.infoCard}>
              <strong>Portfolio</strong>
              <span>작품 관리</span>
            </div>

            <div style={styles.infoCard}>
              <strong>Community</strong>
              <span>피드백 공유</span>
            </div>

            <div style={styles.infoCard}>
              <strong>Certification</strong>
              <span>NFT 인증</span>
            </div>
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <p style={styles.cardBadge}>WELCOME</p>

            <h2 style={styles.cardTitle}>로그인</h2>

            <p style={styles.cardSubtitle}>
              계정으로 로그인하여 포트폴리오를 관리하세요.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div>
              <label style={styles.label}>이메일</label>

              <input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>비밀번호</label>

              <input
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
            </div>

            {errorMsg && <p style={styles.error}>{errorMsg}</p>}

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <p style={styles.linkText}>
            아직 계정이 없나요?{" "}
            <Link to="/register" style={styles.link}>
              회원가입
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "#f8fafc",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
  },

  container: {
    width: "100%",
    maxWidth: "1180px",
    display: "grid",
    gridTemplateColumns: "1fr 430px",
    gap: "28px",
    alignItems: "stretch",
  },

  leftPanel: {
    background: "#ffffff",
    borderRadius: "30px",
    padding: "52px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 20px 50px rgba(15,23,42,0.06)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  badge: {
    display: "inline-flex",
    alignSelf: "flex-start",
    margin: 0,
    marginBottom: "24px",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "900",
    letterSpacing: "1px",
  },

  title: {
    margin: 0,
    fontSize: "52px",
    lineHeight: 1.15,
    fontWeight: "950",
    color: "#0f172a",
    letterSpacing: "-2px",
  },

  description: {
    marginTop: "22px",
    color: "#64748b",
    fontSize: "16px",
    lineHeight: 1.8,
    maxWidth: "580px",
  },

  infoBox: {
    marginTop: "40px",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "14px",
  },

  infoCard: {
    padding: "18px",
    borderRadius: "18px",
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    color: "#334155",
  },

  card: {
    background: "#ffffff",
    borderRadius: "30px",
    border: "1px solid #e5e7eb",
    padding: "38px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    boxShadow: "0 20px 50px rgba(15,23,42,0.06)",
  },

  cardHeader: {
    marginBottom: "28px",
  },

  cardBadge: {
    display: "inline-flex",
    margin: 0,
    marginBottom: "12px",
    padding: "7px 12px",
    borderRadius: "999px",
    background: "#f1f5f9",
    color: "#334155",
    fontSize: "12px",
    fontWeight: "900",
    letterSpacing: "1px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "36px",
    fontWeight: "950",
    color: "#0f172a",
    letterSpacing: "-1px",
  },

  cardSubtitle: {
    marginTop: "10px",
    color: "#64748b",
    fontSize: "15px",
    lineHeight: 1.6,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "900",
    color: "#334155",
  },

  input: {
    width: "100%",
    padding: "15px 16px",
    borderRadius: "15px",
    border: "1px solid #dbe3ef",
    background: "#ffffff",
    outline: "none",
    color: "#0f172a",
    fontSize: "14px",
    boxSizing: "border-box",
  },

  button: {
    marginTop: "6px",
    padding: "15px",
    borderRadius: "15px",
    border: "none",
    background: "#0f172a",
    color: "#ffffff",
    fontWeight: "900",
    cursor: "pointer",
    fontSize: "15px",
  },

  error: {
    margin: 0,
    color: "#dc2626",
    fontSize: "14px",
    fontWeight: "800",
  },

  linkText: {
    marginTop: "22px",
    textAlign: "center",
    fontSize: "14px",
    color: "#64748b",
  },

  link: {
    color: "#0f172a",
    textDecoration: "none",
    fontWeight: "900",
  },
};

export default LoginPage;