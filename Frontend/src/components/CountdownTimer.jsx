import React, { useEffect, useState } from "react";

const CountdownTimer = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateTimer = () => {
      const diff = new Date(endTime) - new Date();
      if (diff <= 0) {
        setTimeLeft("Auction Ended");
        return false;
      }
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      return true;
    };

    updateTimer();
    const interval = setInterval(() => {
      const keepRunning = updateTimer();
      if (!keepRunning) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <span
      className={`text-sm font-semibold ${
        timeLeft === "Auction Ended" ? "text-gray-500" : "text-red-500"
      }`}
    >
      {timeLeft}
    </span>
  );
};

export default CountdownTimer;
