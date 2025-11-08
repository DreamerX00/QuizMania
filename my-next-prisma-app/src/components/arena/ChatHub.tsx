import React from "react";
import styles from "./LeftPanel.module.css";

const ChatHub = () => {
  return (
    <div className={`p-6 rounded-3xl ${styles["neon-glass"]}`}>
      <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">🔥 Chat Hub</h2>
      {/* Content for Chat Hub will go here */}
    </div>
  );
};

export default ChatHub; 
