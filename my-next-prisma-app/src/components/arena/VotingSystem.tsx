import React from "react";
import styles from "./LeftPanel.module.css";

const VotingSystem = () => {
  return (
    <div className={`p-6 rounded-3xl ${styles["neon-glass"]}`}>
      <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">🗳️ Voting System</h2>
      {/* Content for Voting System will go here */}
    </div>
  );
};

export default VotingSystem; 