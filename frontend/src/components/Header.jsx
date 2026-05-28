import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getToken, removeToken } from "../utils/auth";

function Header() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [token, setTokenState] = useState(getToken());

  const isLoggedIn = !!token;

  const getRoleFromToken = (token) => {
    try {
      if (!token) return null;

      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));

      return decoded.role;
    } catch {
      return null;
    }
  };

  const role = getRoleFromToken(token);

  useEffect(() => {
    const syncAuth = () => {
      setTokenState(getToken());
    };

    window.addEventListener("auth-change", syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("auth-change", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    const keyword = search.trim();

    if (keyword) {
      navigate(`/artworks?search=${encodeURIComponent(keyword)}`);
    } else {
      navigate("/artworks");
    }
  };

  const handleLogout = () => {
    removeToken();
    setTokenState(null);
    window.dispatchEvent(new Event("auth-change"));
    navigate("/");
  };

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        <div style={styles.left}>
          <Link to="/" style={styles.logo}>
            Stufolio
          </Link>

          <nav style={styles.nav}>
            <Link to="/artworks" style={styles.navLink}>
              작품
            </Link>
            <Link to="/community" style={styles.navLink}>
              커뮤니티
            </Link>
            <Link to="/mentoring" style={styles.navLink}>
              멘토링
            </Link>
          </nav>
        </div>

        <form onSubmit={handleSearch} style={styles.searchForm}>
          <span style={styles.searchIcon}>⌕</span>
          <input
            type="text"
            placeholder="작품 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </form>

        <div style={styles.right}>
          {isLoggedIn ? (
            <>
              {role === "student" && (
                <Link to="/student" style={styles.dashboardBtn}>
                  내 포트폴리오
                </Link>
              )}

              {role === "parent" && (
                <Link to="/parent" style={styles.dashboardBtn}>
                  자녀 포트폴리오
                </Link>
              )}

              <Link to="/profile" style={styles.navLink}>
                프로필
              </Link>

              <button onClick={handleLogout} style={styles.logoutBtn}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.navLink}>
                로그인
              </Link>
              <Link to="/register" style={styles.primaryBtn}>
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    height: "76px",
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(14px)",
    borderBottom: "1px solid rgba(226,232,240,0.95)",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
  },
  inner: {
    height: "100%",
    maxWidth: "1680px",
    margin: "0 auto",
    padding: "0 40px",
    display: "grid",
    gridTemplateColumns: "1fr 360px 1fr",
    alignItems: "center",
    gap: "24px",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "26px",
    minWidth: 0,
  },
  logo: {
    fontSize: "24px",
    fontWeight: "950",
    textDecoration: "none",
    color: "#2081e2",
    letterSpacing: "-0.6px",
    whiteSpace: "nowrap",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap",
  },
  navLink: {
    textDecoration: "none",
    color: "#334155",
    fontSize: "14px",
    fontWeight: "850",
    whiteSpace: "nowrap",
  },
  searchForm: {
    height: "44px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "0 14px",
    borderRadius: "999px",
    background: "#f8fbff",
    border: "1px solid #dbe3ef",
  },
  searchIcon: {
    color: "#64748b",
    fontWeight: "950",
    fontSize: "18px",
  },
  searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: "700",
  },
  right: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "14px",
    minWidth: 0,
  },
  dashboardBtn: {
    padding: "10px 14px",
    borderRadius: "13px",
    background: "#e8f3ff",
    color: "#2081e2",
    textDecoration: "none",
    fontWeight: "950",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },
  primaryBtn: {
    background: "#2081e2",
    color: "#fff",
    padding: "10px 15px",
    borderRadius: "13px",
    textDecoration: "none",
    fontWeight: "950",
    fontSize: "14px",
    boxShadow: "0 10px 20px rgba(32,129,226,0.22)",
    whiteSpace: "nowrap",
  },
  logoutBtn: {
    border: "1px solid #fecaca",
    background: "#fff",
    color: "#ef4444",
    padding: "10px 14px",
    borderRadius: "13px",
    cursor: "pointer",
    fontWeight: "950",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },
};

export default Header;