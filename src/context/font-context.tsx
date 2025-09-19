import React, { createContext, useEffect, useState } from 'react';
import { fonts } from '@/config/fonts';

type Font = (typeof fonts)[number];

const FontContext = createContext<{ font: Font; setFont: (font: Font) => void } | undefined>(
  undefined,
);

export const FontProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [font, _setFont] = useState<Font>(() => {
    const savedFont = localStorage.getItem('WL/font');
    return fonts.includes(savedFont as Font) ? (savedFont as Font) : fonts[0];
  });

  useEffect(() => {
    const applyFont = (font: string) => {
      const root = document.documentElement;
      root.classList.forEach((cls) => {
        if (cls.startsWith('font-')) root.classList.remove(cls);
      });
      root.classList.add(`font-${font}`);
    };

    applyFont(font);
  }, [font]);

  const setFont = (font: Font) => {
    localStorage.setItem('WL/font', font);
    _setFont(font);
  };

  return <FontContext value={{ font, setFont }}>{children}</FontContext>;
};
