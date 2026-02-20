import React, { useState } from "react";
import Header from "../component/designComponents/headerComponent";
import { Outlet } from "react-router-dom";
import Footer from "../component/designComponents/footerComponent";
import Sidebar from "../component/designComponents/sideBarComponent";
import "../style/layout.css";

function DefaultLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="app">
      <Header onMenuClick={toggleSidebar} />
      <div className="app-body">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="main">
          <div className="content">
            <Outlet />
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default DefaultLayout;