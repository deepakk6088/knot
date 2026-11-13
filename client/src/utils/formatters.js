export function formatMessageTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatConversationDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function formatDateDivider(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

export function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Sophisticated Royal, Olive and Heritage tone palettes
const HERITAGE_PALETTES = [
  { bg: "bg-[#e8edf7]", text: "text-[#1e3a8a]", border: "border-[#bfd0f0]" }, // Royal Blue
  { bg: "bg-[#edf2ea]", text: "text-[#34452e]", border: "border-[#c8d8c3]" }, // Rich Olive
  { bg: "bg-[#f5f1e4]", text: "text-[#6b551e]", border: "border-[#dfd5b9]" }, // Muted Bronze Gold
  { bg: "bg-[#e6f1ee]", text: "text-[#1d4d42]", border: "border-[#bedcd4]" }, // Deep Pine Sage
  { bg: "bg-[#f8ede6]", text: "text-[#853f19]", border: "border-[#edd0be]" }, // Terracotta
  { bg: "bg-[#f6e8ee]", text: "text-[#78183c]", border: "border-[#e7bed0]" }, // Warm Burgundy
  { bg: "bg-[#e9edf2]", text: "text-[#24354c]", border: "border-[#c4cfdf]" }  // Slate Navy
];

export function getAvatarColor(identifier = "") {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % HERITAGE_PALETTES.length;
  return HERITAGE_PALETTES[index];
}
