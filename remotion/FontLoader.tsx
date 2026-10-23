import React, { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { FONT_PAIRINGS, googleFontCss } from "../src/utils";

export const FontLoader: React.FC<{ fonts?: (string | undefined)[] }> = ({
  fonts,
}) => {
  const [handle] = useState(() => delayRender("Memuat font"));
  useEffect(() => {
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        continueRender(handle);
      }
    };
    const all = [
      ...FONT_PAIRINGS.flatMap((f) => [f.heading, f.body]),
      ...(fonts || []),
    ];
    const style = document.createElement("style");
    style.textContent = googleFontCss(all);
    document.head.appendChild(style);
    Promise.race([
      document.fonts.ready.then(() => new Promise((r) => setTimeout(r, 250))),
      new Promise((r) => setTimeout(r, 4000)),
    ])
      .then(finish)
      .catch(finish);
    return () => style.remove();
  }, [handle, fonts]);
  return null;
};

export default FontLoader;
