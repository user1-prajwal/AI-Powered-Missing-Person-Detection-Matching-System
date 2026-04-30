// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import PublicUpload   from "./pages/PublicUpload";
// import AdminLogin     from "./pages/AdminLogin";
// import AdminDashboard from "./pages/AdminDashboard";
// import Navbar         from "./components/Navbar";

// function App() {
//   return (
//     <BrowserRouter>
//       <Navbar />
//       <Routes>
//         <Route path="/"       element={<PublicUpload />} />
//         <Route path="/admin"  element={<AdminLogin />} />
//         <Route path="/dashboard" element={<AdminDashboard />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;


// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import PublicUpload   from "./pages/PublicUpload";
// import AdminLogin     from "./pages/AdminLogin";
// import AdminDashboard from "./pages/AdminDashboard";
// import Register       from "./pages/Register";
// import Navbar         from "./components/Navbar";

// function App() {
//   return (
//     <BrowserRouter>
//       <Navbar />
//       <Routes>
//         <Route path="/"          element={<PublicUpload />} />
//         <Route path="/admin"     element={<AdminLogin />} />
//         <Route path="/register"  element={<Register />} />
//         <Route path="/dashboard" element={<AdminDashboard />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;



// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import PublicUpload        from "./pages/PublicUpload";
// import AdminLogin          from "./pages/AdminLogin";
// import AdminDashboard      from "./pages/AdminDashboard";
// import Register            from "./pages/Register";
// import SuperAdminLogin     from "./pages/SuperAdminLogin";
// import SuperAdminDashboard from "./pages/SuperAdminDashboard";
// import Navbar              from "./components/Navbar";

// function App() {
//   return (
//     <BrowserRouter>
//       <Navbar />
//       <Routes>
//         <Route path="/"                   element={<PublicUpload />} />
//         <Route path="/admin"              element={<AdminLogin />} />
//         <Route path="/register"           element={<Register />} />
//         <Route path="/dashboard"          element={<AdminDashboard />} />
//         <Route path="/superadmin"         element={<SuperAdminLogin />} />
//         <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;


import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar          from "./components/Navbar";
import PublicUpload    from "./pages/PublicUpload";
import AdminLogin      from "./pages/AdminLogin";
import AdminDashboard  from "./pages/AdminDashboard";
import Register        from "./pages/Register";
import SuperAdminLogin     from "./pages/SuperAdminLogin";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"                     element={<PublicUpload />} />
        <Route path="/admin"                element={<AdminLogin />} />
        <Route path="/register"             element={<Register />} />
        <Route path="/dashboard"            element={<AdminDashboard />} />
        <Route path="/superadmin"           element={<SuperAdminLogin />} />
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;