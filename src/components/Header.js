import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/images/logo.png"; // 로고 이미지 경로

const Header = () => {
  return (
    <header style={styles.header}>
      {/* 왼쪽: 로고 */}
      <div style={styles.leftSection}>
        <Link to="/" style={styles.logoLink}>
          <img src={logo} alt="Logo" style={styles.logo} />
        </Link>
      </div>

      {/* 가운데: 브랜드 이름 */}
      <h1 style={styles.brand}>BESTDAOU</h1>

      {/* 오른쪽: 사용자 이름 */}
      <div style={styles.rightSection}>
        <span style={styles.userName}>최고다우님</span>
      </div>
    </header>
  );
};

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff", // 흰색 배경
    height: "80px",
    padding: "0 20px",
    position: "fixed",
    width: "100%",
    top: 0,
    zIndex: 1000,
    boxShadow: "0 1px 5px rgba(0, 0, 0, 0.1)", // 부드러운 그림자 추가
  },
  leftSection: {
    display: "flex",
    alignItems: "center",
  },
  logoLink: {
    textDecoration: "none",
  },
  logo: {
    width: "60px",
    height: "60px",
  },
  brand: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#4A90E2", // 부드러운 파란색으로 브랜드 이름 설정
    marginLeft: "90px",
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
  },
  userName: {
    fontSize: "28px", // 약간 작은 크기로 세련되게
    fontWeight: "500", // 부드러운 굵기로 조정
    color: "#333333", // 약간 차분한 어두운 회색
    whiteSpace: "nowrap", // 한 줄 유지
    marginRight: "70px", // 여백 유지
    fontFamily: "'Poppins', 'Noto Sans KR', sans-serif", // 세련된 Google Fonts 조합
    letterSpacing: "0.8px", // 자간 약간 늘림
    lineHeight: "1.2", // 줄 간격 조정
    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.1)", // 약간의 그림자 효과
  },
};

export default Header;
