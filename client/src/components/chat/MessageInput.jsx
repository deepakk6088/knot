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
      className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
    >
      <input
        ref={inputRef}
        type="text"
        placeholder={disabled ? "Select a conversation to start typing..." : "Type a message..."}
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50"
      />

      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed shadow-md disabled:shadow-none flex items-center justify-center shrink-0"
        title="Send Message"
      >
        <SendHorizonal size={18} />
      </button>
    </form>
  );
}
