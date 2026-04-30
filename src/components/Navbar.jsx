// import { Link } from "react-router-dom";

// function Navbar() {
//   return (
//     <nav style={styles.nav}>
//       <span style={styles.logo}>🔍 Missing Person Finder</span>
//       <div>
//         <Link to="/"      style={styles.link}>Report Sighting</Link>
//         <Link to="/admin" style={styles.link}>Admin Login</Link>
//       </div>
//     </nav>
//   );
// }

// const styles = {
//   nav: {
//     display        : "flex",
//     justifyContent : "space-between",
//     alignItems     : "center",
//     padding        : "14px 30px",
//     backgroundColor: "#1a1a2e",
//     color          : "white",
//   },
//   logo: { fontSize: "20px", fontWeight: "bold" },
//   link: {
//     color         : "white",
//     marginLeft    : "20px",
//     textDecoration: "none",
//     fontWeight    : "500",
//   }
// };

// export default Navbar;


// import { Link } from "react-router-dom";

// function Navbar() {
//   return (
//     <nav style={styles.nav}>
//       <Link to="/" style={styles.logo}>🔍 Missing Person Finder</Link>
//       <div>
//         <Link to="/"         style={styles.link}>Report Sighting</Link>
//         <Link to="/admin"    style={styles.link}>Admin Login</Link>
//         {/* <Link to="/register" style={styles.link}>Register Org</Link> */}
//       </div>
//     </nav>
//   );
// }

// const styles = {
//   nav  : { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 30px", backgroundColor: "#1a1a2e", color: "white" },
//   logo : { fontSize: "20px", fontWeight: "bold", color: "white", textDecoration: "none" },
//   link : { color: "white", marginLeft: "20px", textDecoration: "none", fontWeight: "500" }
// };

// export default Navbar;



import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();

  // Super admin has its own header — hide navbar
  if (pathname.startsWith("/superadmin")) return null;

  return (
    <nav style={S.nav}>

      {/* Logo */}
      <Link to="/" style={S.logo}>
        <div style={S.logoIcon}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <span style={S.logoText}>
          FindSafe<span style={{ color: "#60a5fa" }}>.ai</span>
        </span>
      </Link>

      {/* Links */}
      <div style={{ display: "flex", gap: "8px" }}>
        <Link to="/" style={{
          ...S.link,
          ...(pathname === "/" ? S.activeLink : {})
        }}>
          Report Sighting
        </Link>
        <Link to="/admin" style={{
          ...S.link,
          ...(pathname === "/admin" ? S.activeLink : {})
        }}>
          Admin Portal
        </Link>
      </div>

    </nav>
  );
}

const S = {
  nav: {
    display        : "flex",
    justifyContent : "space-between",
    alignItems     : "center",
    padding        : "0 32px",
    height         : "64px",
    background     : "rgba(2,8,23,0.9)",
    backdropFilter : "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderBottom   : "1px solid rgba(59,130,246,0.1)",
    position       : "sticky",
    top            : 0,
    zIndex         : 100,
  },
  logo: {
    display        : "flex",
    alignItems     : "center",
    gap            : "10px",
    textDecoration : "none",
  },
  logoIcon: {
    width          : "36px",
    height         : "36px",
    borderRadius   : "10px",
    background     : "linear-gradient(135deg, #1d4ed8, #3b82f6)",
    display        : "flex",
    alignItems     : "center",
    justifyContent : "center",
    boxShadow      : "0 4px 14px rgba(59,130,246,0.4)",
  },
  logoText: {
    fontFamily : "'Syne', sans-serif",
    fontSize   : "18px",
    fontWeight : "700",
    color      : "#f0f4ff",
  },
  link: {
    padding        : "8px 16px",
    borderRadius   : "8px",
    textDecoration : "none",
    color          : "#64748b",
    fontSize       : "14px",
    fontWeight     : "500",
    transition     : "all 0.2s",
  },
  activeLink: {
    background : "rgba(59,130,246,0.1)",
    color      : "#60a5fa",
    border     : "1px solid rgba(59,130,246,0.2)",
  },
};