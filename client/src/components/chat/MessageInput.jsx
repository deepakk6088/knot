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
      className="p-3.5 bg-[#fbf9f5] border-t border-[#e5dfd5] flex items-center gap-2.5 shadow-2xs"
    >
      <input
        ref={inputRef}
        type="text"
        placeholder={disabled ? "Select a conversation to start typing..." : "Type a message..."}
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-[#ffffff] border border-[#ded8cb] focus:border-[#1e3a8a] focus:ring-4 focus:ring-[#bfd0f0] text-slate-900 placeholder-slate-400 text-sm rounded-2xl px-4 py-3 transition-all disabled:opacity-50 outline-none shadow-2xs"
      />

      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="p-3 bg-[#1e3a8a] hover:bg-[#1e40af] disabled:bg-[#ede8de] disabled:text-slate-400 text-[#fbf9f5] rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed shadow-md shadow-[#1e3a8a]/20 disabled:shadow-none flex items-center justify-center shrink-0"
        title="Send Message"
      >
        <SendHorizonal size={18} />
      </button>
    </form>
  );
}
