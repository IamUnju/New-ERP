import React, { useState } from "react";
import Header from "../component/designComponents/headerComponent";
import { Outlet } from "react-router-dom";
import Footer from "../component/designComponents/footerComponent";
import Sidebar from "../component/designComponents/sideBarComponent";
import "../style/layout.css";

function DefaultLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="app">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="main">
        <Header onMenuClick={toggleSidebar} />
        <div className="content">
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default DefaultLayout;