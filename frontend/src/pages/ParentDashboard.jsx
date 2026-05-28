import { useEffect, useState } from "react";
import { getMeApi } from "../api/user";
import { getMyStudentsApi, linkStudentApi } from "../api/parent";
import { getStudentPortfoliosApi } from "../api/portfolio";
import { getToken, removeToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";

function ParentDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [studentEmail, setStudentEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);

  const fetchData = async () => {
    try {
      const token = getToken();

      const me = await getMeApi(token);
      const studentData = await getMyStudentsApi(token);

      setUser(me.user || me);
      setStudents(studentData.students || []);
    } catch (error) {
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
    window.dispatchEvent(new Event("auth-change"));
    navigate("/login");
  };

  const handleLinkStudent = async (e) => {
    e.preventDefault();

    if (!studentEmail.trim()) {
      alert("학생 이메일을 입력해주세요.");
      return;
    }

    try {
      setLinking(true);
      const token = getToken();

      await linkStudentApi(token, studentEmail.trim());

      alert("자녀 연결 성공");
      setStudentEmail("");
      await fetchData();
    } catch (error) {
      alert(error.message);
    } finally {
      setLinking(false);
    }
  };

  const handleSelectStudent = async (student) => {
    try {
      const token = getToken();
      const data = await getStudentPortfoliosApi(token, student.id);

      setSelectedStudent(student);
      setPortfolios(data.portfolios || []);
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <div style={styles.loading}>로딩 중...</div>;

  return (
    <div style={styles.wrapper}>
      <main style={styles.container}>
        <section style={styles.heroCard}>
          <div>
            <p style={styles.badge}>PARENT DASHBOARD</p>
            <h1 style={styles.mainTitle}>자녀 포트폴리오 관리</h1>
            <p style={styles.subTitle}>
              학생 이메일을 연결하고 자녀의 작품과 NFT 인증 상태를 확인하세요.
            </p>
          </div>

          <button onClick={handleLogout} style={styles.logoutButton}>
            로그아웃
          </button>
        </section>

        <section style={styles.profileCard}>
          <div style={styles.profileIcon}>P</div>
          <div>
            <p style={styles.profileLabel}>로그인 계정</p>
            <h2 style={styles.profileEmail}>{user?.email}</h2>
            <p style={styles.profileRole}>역할: {user?.role || "parent"}</p>
          </div>
        </section>

        <section style={styles.grid}>
          <aside style={styles.sideCard}>
            <h2 style={styles.sectionTitle}>내 자녀 목록</h2>
            <p style={styles.sectionDesc}>학생 이메일로 자녀를 연결하세요.</p>

            <form onSubmit={handleLinkStudent} style={styles.linkForm}>
              <input
                type="email"
                placeholder="학생 이메일 입력"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                style={styles.linkInput}
              />

              <button type="submit" style={styles.linkButton} disabled={linking}>
                {linking ? "연결 중..." : "자녀 연결"}
              </button>
            </form>

            {students.length === 0 ? (
              <div style={styles.emptyState}>
                <p>연결된 자녀가 없습니다.</p>
              </div>
            ) : (
              <div style={styles.studentList}>
                {students.map((student) => {
                  const isSelected = selectedStudent?.id === student.id;

                  return (
                    <button
                      key={student.id}
                      onClick={() => handleSelectStudent(student)}
                      style={
                        isSelected
                          ? styles.activeStudentButton
                          : styles.studentButton
                      }
                    >
                      <strong>
                        {student.studentProfile?.studentName || student.email}
                      </strong>
                      <span style={styles.subText}>{student.email}</span>
                      <span style={styles.subText}>
                        {student.studentProfile?.academyName ||
                          "학원 정보 없음"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </aside>

          <section style={styles.contentCard}>
            <div style={styles.contentHeader}>
              <div>
                <p style={styles.contentBadge}>STUDENT WORKS</p>
                <h2 style={styles.sectionTitle}>
                  {selectedStudent
                    ? `${
                        selectedStudent.studentProfile?.studentName ||
                        selectedStudent.email
                      }의 작품`
                    : "자녀를 선택하세요"}
                </h2>
              </div>

              {selectedStudent && (
                <span style={styles.countPill}>총 {portfolios.length}개</span>
              )}
            </div>

            {!selectedStudent && (
              <div style={styles.bigEmptyState}>
                <div style={styles.emptyIcon}>✦</div>
                <h3>자녀를 선택해주세요.</h3>
                <p>왼쪽 목록에서 연결된 학생을 선택하면 작품이 표시됩니다.</p>
              </div>
            )}

            {selectedStudent && portfolios.length === 0 && (
              <div style={styles.bigEmptyState}>
                <div style={styles.emptyIcon}>✦</div>
                <h3>업로드된 작품이 없습니다.</h3>
                <p>아직 해당 학생이 등록한 작품이 없습니다.</p>
              </div>
            )}

            {portfolios.length > 0 && (
              <div style={styles.portfolioList}>
                {portfolios.map((item) => (
                  <article
                    key={item.id}
                    style={styles.portfolioItem}
                    onClick={() => navigate(`/portfolio/${item.id}`)}
                  >
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}${item.imageUrl}`}
                      alt={item.title}
                      style={styles.image}
                    />

                    <div style={styles.cardBody}>
                      <span style={styles.categoryBadge}>
                        {item.category || "기타"}
                      </span>

                      <h3 style={styles.cardTitle}>{item.title}</h3>

                      <p style={styles.cardDesc}>
                        {item.description || "작품 설명이 없습니다."}
                      </p>

                      <span
                        style={
                          item.isMinted
                            ? styles.statusDone
                            : styles.statusPending
                        }
                      >
                        {item.isMinted ? "NFT 인증 완료" : "NFT 미인증"}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #eef5ff 0%, #f8fafc 42%, #f1f5f9 100%)",
    color: "#0f172a",
  },
  container: {
    maxWidth: "1500px",
    margin: "0 auto",
    padding: "44px 52px 76px",
  },
  loading: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f8fafc",
    color: "#334155",
    fontWeight: "900",
  },
  heroCard: {
    background: "rgba(255,255,255,0.94)",
    borderRadius: "24px",
    padding: "30px",
    border: "1px solid rgba(226,232,240,0.95)",
    boxShadow: "0 24px 60px rgba(15,23,42,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "24px",
    marginBottom: "22px",
  },
  badge: {
    display: "inline-flex",
    margin: 0,
    marginBottom: "14px",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "950",
    letterSpacing: "1px",
  },
  mainTitle: {
    margin: 0,
    fontSize: "36px",
    fontWeight: "950",
    letterSpacing: "-1px",
  },
  subTitle: {
    margin: "12px 0 0",
    color: "#64748b",
    fontSize: "15px",
    lineHeight: 1.7,
  },
  logoutButton: {
    padding: "13px 18px",
    borderRadius: "14px",
    border: "1px solid #fecaca",
    background: "#fff",
    color: "#ef4444",
    cursor: "pointer",
    fontWeight: "950",
  },
  profileCard: {
    background: "rgba(255,255,255,0.94)",
    padding: "22px",
    borderRadius: "20px",
    marginBottom: "22px",
    display: "flex",
    gap: "16px",
    alignItems: "center",
    border: "1px solid rgba(226,232,240,0.95)",
    boxShadow: "0 14px 34px rgba(15,23,42,0.05)",
  },
  profileIcon: {
    width: "54px",
    height: "54px",
    borderRadius: "17px",
    background: "#e8f3ff",
    color: "#2081e2",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "950",
    fontSize: "22px",
  },
  profileLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "800",
  },
  profileEmail: {
    margin: "4px 0",
    fontSize: "20px",
    fontWeight: "950",
  },
  profileRole: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "800",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: "24px",
  },
  sideCard: {
    background: "rgba(255,255,255,0.94)",
    borderRadius: "22px",
    padding: "22px",
    border: "1px solid rgba(226,232,240,0.95)",
    boxShadow: "0 16px 38px rgba(15,23,42,0.06)",
    height: "fit-content",
  },
  contentCard: {
    background: "rgba(255,255,255,0.94)",
    borderRadius: "22px",
    padding: "24px",
    border: "1px solid rgba(226,232,240,0.95)",
    boxShadow: "0 16px 38px rgba(15,23,42,0.06)",
    minHeight: "360px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "23px",
    fontWeight: "950",
    letterSpacing: "-0.5px",
  },
  sectionDesc: {
    margin: "8px 0 0",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  linkForm: {
    margin: "18px 0 20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  linkInput: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: "13px",
    border: "1px solid #dbe3ef",
    background: "#f8fafc",
    outline: "none",
    boxSizing: "border-box",
    color: "#0f172a",
    fontWeight: "700",
  },
  linkButton: {
    padding: "12px 14px",
    borderRadius: "13px",
    border: "none",
    background: "#2081e2",
    color: "#fff",
    fontWeight: "950",
    cursor: "pointer",
  },
  emptyState: {
    marginTop: "14px",
    padding: "16px",
    borderRadius: "14px",
    background: "#f8fafc",
    border: "1px dashed #cbd5e1",
    color: "#64748b",
    fontSize: "14px",
  },
  studentList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  studentButton: {
    width: "100%",
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
    background: "#f8fafc",
    textAlign: "left",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    color: "#0f172a",
  },
  activeStudentButton: {
    width: "100%",
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid #bfdbfe",
    background: "#eff6ff",
    textAlign: "left",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    color: "#0f172a",
    boxShadow: "0 10px 20px rgba(37,99,235,0.10)",
  },
  subText: {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "700",
  },
  contentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "22px",
  },
  contentBadge: {
    margin: "0 0 8px",
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "950",
    letterSpacing: "1px",
  },
  countPill: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "950",
  },
  bigEmptyState: {
    minHeight: "260px",
    borderRadius: "18px",
    background: "#f8fafc",
    border: "1px dashed #cbd5e1",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    color: "#64748b",
    padding: "30px",
  },
  emptyIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "17px",
    background: "#e8f3ff",
    color: "#2081e2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "950",
    fontSize: "24px",
    marginBottom: "14px",
  },
  portfolioList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
    gap: "18px",
  },
  portfolioItem: {
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    overflow: "hidden",
    background: "#fff",
    boxShadow: "0 10px 24px rgba(15,23,42,0.05)",
    cursor: "pointer",
    transition: "0.2s ease",
  },
  image: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
    display: "block",
    background: "#f1f5f9",
  },
  cardBody: {
    padding: "15px",
  },
  categoryBadge: {
    display: "inline-block",
    marginBottom: "8px",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: "11px",
    fontWeight: "950",
  },
  cardTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "950",
  },
  cardDesc: {
    margin: "8px 0 12px",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.5,
    minHeight: "38px",
  },
  statusPending: {
    display: "inline-block",
    padding: "7px 10px",
    borderRadius: "999px",
    background: "#fffbeb",
    color: "#92400e",
    fontSize: "12px",
    fontWeight: "950",
  },
  statusDone: {
    display: "inline-block",
    padding: "7px 10px",
    borderRadius: "999px",
    background: "#dcfce7",
    color: "#166534",
    fontSize: "12px",
    fontWeight: "950",
  },
};

export default ParentDashboard;