
import React from "react";
import {
  ArrowLeft,
  Check,
  Palette,
  Monitor
} from "lucide-react";
import { THEMES, useTheme } from "../../context/ThemeContext";

export default function SettingsPage({ onBack }) {
  const { theme, setTheme } = useTheme();

  return (
    <main
      className="flex-1 min-w-0 h-full overflow-y-auto p-6 md:p-10"
      style={{
        backgroundColor: "var(--app-bg)",
        color: "var(--app-text)"
      }}
    >
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-8 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--app-muted)" }}
        >
          <ArrowLeft size={17} />
          Back to chats
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="p-3 rounded-xl"
              style={{
                backgroundColor: "var(--app-accent-soft)",
                color: "var(--app-accent)"
              }}
            >
              <Monitor size={22} />
            </div>

            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: "var(--app-heading)" }}
              >
                Settings
              </h1>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--app-muted)" }}
              >
                Customize your KNOT experience
              </p>
            </div>
          </div>
        </div>

        <section
          className="rounded-2xl border p-6 md:p-8"
          style={{
            backgroundColor: "var(--app-surface)",
            borderColor: "var(--app-border)"
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Palette
              size={20}
              style={{ color: "var(--app-accent)" }}
            />
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--app-heading)" }}
            >
              Appearance
            </h2>
          </div>

          <p
            className="text-sm mb-7"
            style={{ color: "var(--app-muted)" }}
          >
            Choose a theme for your KNOT interface. Your selection
            is saved automatically.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {THEMES.map((item) => {
              const isActive = theme === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setTheme(item.id)}
                  aria-pressed={isActive}
                  className="text-left rounded-xl border-2 p-4 transition-all hover:-translate-y-0.5"
                  style={{
                    backgroundColor: "var(--app-surface)",
                    borderColor: isActive
                      ? "var(--app-accent)"
                      : "var(--app-border)"
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="font-semibold text-sm"
                      style={{ color: "var(--app-heading)" }}
                    >
                      {item.name}
                    </span>

                    {isActive && (
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: "var(--app-accent)",
                          color: "#ffffff"
                        }}
                      >
                        <Check size={14} />
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 mb-4">
                    {item.colors.map((color, index) => (
                      <span
                        key={index}
                        className="h-10 flex-1 rounded-lg border"
                        style={{
                          backgroundColor: color,
                          borderColor: "var(--app-border)"
                        }}
                      />
                    ))}
                  </div>

                  <p
                    className="text-xs"
                    style={{ color: "var(--app-muted)" }}
                  >
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <p
          className="text-xs mt-5 text-center"
          style={{ color: "var(--app-muted)" }}
        >
          Your appearance preference is stored on this device.
        </p>
      </div>
    </main>
  );
}
