import React, { useState } from "react";

const BidModal = ({ isOpen, onClose, onBidSubmit }) => {
  const [amount, setAmount] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-80 shadow-lg">
        <h2 className="text-lg font-semibold mb-2">Place Your Bid</h2>
        <input
          type="number"
          placeholder="Enter bid amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border rounded-md w-full p-2 mb-3"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-1 bg-gray-300 rounded-md hover:bg-gray-400">
            Cancel
          </button>
          <button
            onClick={() => {
              onBidSubmit(amount);
              setAmount("");
            }}
            className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default BidModal;
