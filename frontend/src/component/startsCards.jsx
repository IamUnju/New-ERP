import React from "react";

const StatsCard = ({ title, value, color }) => {
  return (
    <div className={`stats-card ${color}`}>
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
};

export default StatsCard;
