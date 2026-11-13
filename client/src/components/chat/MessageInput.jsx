import React, { useState, useRef, useEffect } from "react";
import { SendHorizonal } from "lucide-react";

export default function MessageInput({ onSendMessage, disabled }) {
  const [text, setText] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    onSendMessage(trimmed);
    setText("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3.5 bg-[#101117] border-t border-white/10 flex items-center gap-2.5"
    >
      <input
        ref={inputRef}
        type="text"
        placeholder={disabled ? "Select a conversation to start typing..." : "Type a message..."}
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-[#181a24] border border-white/10 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
      />

      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="p-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-[#181a24] disabled:text-gray-600 text-white rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed shadow-md shadow-indigo-500/20 disabled:shadow-none flex items-center justify-center shrink-0"
        title="Send Message"
      >
        <SendHorizonal size={18} />
      </button>
    </form>
  );
}
