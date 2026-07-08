import { useState, useMemo } from "react";

// --- color helpers -------------------------------------------------

function hslToHex(h, s, l) {
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function relativeLuminance(hex) {
  const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = rgb.map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (light + 0.05) / (dark + 0.05);
}

function ratingFor(ratio) {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA18";
  return "FAIL";
}

// --- slider row ------------------------------------------------------

function Slider({ label, value, max, step = 0.01, onChange, accent }) {
  return (
    <div className="mb-5">
      <div
        className="text-xs mb-2 font-medium tracking-wide"
        style={{ color: accent }}
      >
        {label} {typeof value === "number" ? value.toFixed(2) : value}
        {label === "Hue" ? "°" : ""}
      </div>
      <input
        type="range"
        min={0}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-[2px] appearance-none cursor-pointer rounded-full"
        style={{
          background: accent + "55",
          accentColor: accent,
        }}
      />
    </div>
  );
}

// --- main component ----------------------------------------------

export default function ColorContrastChecker() {
  const [text, setText] = useState({ h: 75, s: 0.65, l: 0.56 });
  const [bg, setBg] = useState({ h: 255, s: 0.67, l: 0.43 });

  const textHex = useMemo(() => hslToHex(text.h, text.s, text.l), [text]);
  const bgHex = useMemo(() => hslToHex(bg.h, bg.s, bg.l), [bg]);
  const ratio = useMemo(() => contrastRatio(textHex, bgHex), [textHex, bgHex]);
  const rating = ratingFor(ratio);

  const setField = (setter) => (field) => (value) =>
    setter((prev) => ({ ...prev, [field]: value }));

  const setTextField = setField(setText);
  const setBgField = setField(setBg);

  const reverse = () => {
    setText(bg);
    setBg(text);
  };

  const randomize = () => {
    setText({
      h: Math.round(Math.random() * 360),
      s: Math.round(Math.random() * 80 + 20) / 100,
      l: Math.round(Math.random() * 40 + 45) / 100,
    });
    setBg({
      h: Math.round(Math.random() * 360),
      s: Math.round(Math.random() * 80 + 20) / 100,
      l: Math.round(Math.random() * 40 + 10) / 100,
    });
  };

  const ratingColor =
    rating === "AAA" || rating === "AA"
      ? textHex
      : rating === "AA18"
      ? "#f2c94c"
      : "#ff6b6b";

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6 transition-colors duration-300"
      style={{ backgroundColor: "#161022" }}
    >
      <div
        className="w-full max-w-3xl rounded-[32px] p-10 transition-colors duration-300"
        style={{ backgroundColor: bgHex }}
      >
        {/* Hero specimen */}
        <div className="flex items-end gap-4 mb-1">
          <span
            className="font-black leading-none transition-colors duration-300"
            style={{ color: textHex, fontSize: "7rem", letterSpacing: "-0.03em" }}
          >
            Aa
          </span>
          <div className="flex items-baseline gap-2 pb-3">
            <span
              className="font-bold transition-colors duration-300"
              style={{ color: textHex, fontSize: "2rem" }}
            >
              {ratio.toFixed(2)}
            </span>
            <span
              className="font-bold text-sm transition-colors duration-300"
              style={{ color: ratingColor }}
            >
              {rating}
            </span>
          </div>
        </div>

        <p
          className="text-xs max-w-md mb-10 leading-relaxed opacity-80 transition-colors duration-300"
          style={{ color: textHex }}
        >
          Contrast is the difference in luminance that makes text
          readable against its background. WCAG recommends a ratio of at
          least 4.5 for normal text.
        </p>

        {/* Hex readout */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <div
              className="text-xs mb-1 opacity-70 transition-colors duration-300"
              style={{ color: textHex }}
            >
              Text
            </div>
            <div
              className="text-3xl font-bold tracking-tight transition-colors duration-300"
              style={{ color: textHex }}
            >
              {textHex}
            </div>
          </div>
          <div>
            <div
              className="text-xs mb-1 opacity-70 transition-colors duration-300"
              style={{ color: textHex }}
            >
              Background
            </div>
            <div
              className="text-3xl font-bold tracking-tight transition-colors duration-300"
              style={{ color: textHex }}
            >
              {bgHex}
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-2 gap-x-8 mb-8">
          <div>
            <Slider
              label="Hue"
              value={text.h}
              max={360}
              step={1}
              accent={textHex}
              onChange={setTextField("h")}
            />
            <Slider
              label="Saturation"
              value={text.s}
              max={1}
              accent={textHex}
              onChange={setTextField("s")}
            />
            <Slider
              label="Lightness"
              value={text.l}
              max={1}
              accent={textHex}
              onChange={setTextField("l")}
            />
          </div>
          <div>
            <Slider
              label="Hue"
              value={bg.h}
              max={360}
              step={1}
              accent={textHex}
              onChange={setBgField("h")}
            />
            <Slider
              label="Saturation"
              value={bg.s}
              max={1}
              accent={textHex}
              onChange={setBgField("s")}
            />
            <Slider
              label="Lightness"
              value={bg.l}
              max={1}
              accent={textHex}
              onChange={setBgField("l")}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={reverse}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-300"
            style={{ backgroundColor: textHex, color: bgHex }}
          >
            Reverse
          </button>
          <button
            onClick={randomize}
            className="px-4 py-2 rounded-lg text-sm font-semibold border transition-colors duration-300"
            style={{ borderColor: textHex, color: textHex }}
          >
            Random
          </button>
        </div>
      </div>
    </div>
  );
}
