'use client';

/**
 * Accordion
 *
 * Design system component — rounded card accordion with expand/collapse.
 *
 * NAME: Accordion
 *
 * WHEN TO USE:
 * - FAQ sections — group common questions with expandable answers
 * - Info disclosure — any list of title + hidden detail pairs
 *   (e.g. "How it works" breakdowns, token details, fee explanations)
 * - Settings/config panels — collapsible option groups
 *
 * WHEN NOT TO USE:
 * - Single expand/collapse (use a simple disclosure/toggle instead)
 * - Navigation menus (use a proper nav component)
 * - Tabbed content where all options should be visible (use tabs)
 *
 * PROPS:
 * - items: array of { title: string, content: React.ReactNode }
 * - allowMultiple?: boolean — allow multiple items open at once (default: false)
 */

import React, { useState, useCallback } from 'react';

interface AccordionItem {
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
}

export function Accordion({ items, allowMultiple = false }: AccordionProps) {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set());

  const toggle = useCallback(
    (index: number) => {
      setOpenIndices((prev) => {
        const next = new Set(allowMultiple ? prev : []);
        if (prev.has(index)) {
          next.delete(index);
        } else {
          next.add(index);
        }
        return next;
      });
    },
    [allowMultiple]
  );

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      {items.map((item, i) => {
        const isOpen = openIndices.has(i);
        return (
          <div
            key={i}
            className="rounded-[24px] bg-[var(--surface)] overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggle(i)}
              className="w-full flex items-center justify-between gap-4 text-left px-6 py-5 cursor-pointer"
              aria-expanded={isOpen}
            >
              <span className="font-bold text-[18px] md:text-[20px] leading-[1.2] text-[var(--ink)] tracking-[-0.2px]">
                {item.title}
              </span>
              <span
                className="shrink-0 text-[var(--ink)] text-[26px] leading-[1]"
                aria-hidden="true"
                style={{
                  transform: isOpen ? 'rotate(45deg)' : 'none',
                  transition: 'transform 0.2s ease',
                }}
              >
                +
              </span>
            </button>

            <div
              className="grid transition-[grid-template-rows] duration-300 ease-in-out"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <div className="px-6 pb-6 text-[16px] md:text-[18px] leading-[1.4] text-[var(--ink-2)] tracking-[-0.18px]">
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
