import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerApi } from "../api/auth";

function RegisterPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [studentName, setStudentName] = useState("");
  const [academyName, setAcademyName] = useState("");

  const [name, setName] = useState("");
  const [mentorField, setMentorField] = useState("");
  const [bio, setBio] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      setLoading(true);

      const payload =
        role === "student"
          ? {
              email,
              password,
              role,
              studentName,
              academyName,
            }
          : role === "mentor"
          ? {
              email,
              password,
              role,
              name,
              mentorField,
              bio,
            }
          : {
              email,
              password,
              role,
              name,
            };

      await registerApi(payload);

      alert("회원가입 성공");
      navigate("/login");
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>회원가입</h1>
        <p style={styles.subtitle}>계정을 생성하고 시작하세요</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={styles.input}
          >
            <option value="student">학생</option>
            <option value="parent">학부모</option>
            <option value="mentor">멘토</option>
          </select>

          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          {role === "student" && (
            <>
              <input
                type="text"
                placeholder="학생 이름"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                style={styles.input}
              />

              <input
                type="text"
                placeholder="학원명"
                value={academyName}
                onChange={(e) => setAcademyName(e.target.value)}
                style={styles.input}
              />
            </>
          )}

          {role === "parent" && (
            <input
              type="text"
              placeholder="학부모 이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
            />
          )}

          {role === "mentor" && (
            <>
              <input
                type="text"
                placeholder="멘토 이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
              />

              <input
                type="text"
                placeholder="전문 분야 예: UI/UX, 웹툰, 게임원화"
                value={mentorField}
                onChange={(e) => setMentorField(e.target.value)}
                style={styles.input}
              />

              <textarea
                placeholder="멘토 소개"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={styles.textarea}
              />
            </>
          )}

          {errorMsg && <p style={styles.error}>{errorMsg}</p>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <p style={styles.linkText}>
          이미 계정이 있나요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "#f3f4f6",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px",
  },

  card: {
    width: "420px",
    background: "#fff",
    padding: "32px",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    margin: "8px 0 24px",
    color: "#6b7280",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  input: {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
  },

  textarea: {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    minHeight: "110px",
    resize: "vertical",
    outline: "none",
    fontSize: "14px",
    fontFamily: "inherit",
    lineHeight: 1.6,
  },

  button: {
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "#2081e2",
    color: "#fff",
    fontWeight: "800",
    cursor: "pointer",
  },

  error: {
    color: "#dc2626",
    fontSize: "14px",
    margin: 0,
  },

  linkText: {
    marginTop: "16px",
    fontSize: "14px",
  },
};

export default RegisterPage;