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
      className="p-3.5 bg-white border-t border-slate-200/80 flex items-center gap-2.5 shadow-xs"
    >
      <input
        ref={inputRef}
        type="text"
        placeholder={disabled ? "Select a conversation to start typing..." : "Type a message..."}
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-slate-100/80 hover:bg-slate-100/95 focus:bg-white border border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 text-slate-900 placeholder-slate-400 text-sm rounded-2xl px-4 py-3 transition-all disabled:opacity-50 outline-none"
      />

      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="p-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed shadow-md shadow-indigo-500/25 disabled:shadow-none flex items-center justify-center shrink-0"
        title="Send Message"
      >
        <SendHorizonal size={18} />
      </button>
    </form>
  );
}
