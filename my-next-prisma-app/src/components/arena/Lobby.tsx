import React from "react";
import styles from "./LeftPanel.module.css";

const Lobby = () => {
  return (
    <div className={`flex-grow p-6 rounded-3xl ${styles["neon-glass"]}`}>
      <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">🧬 Lobby</h2>
      {/* Content for Lobby will go here */}
    </div>
  );
};

export default Lobby; 