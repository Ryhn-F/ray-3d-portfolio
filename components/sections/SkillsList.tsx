"use client";

import { projects } from "@/data/projects";
import { profile } from "@/data/profile";
import { scrollState } from "@/lib/scroll-state";

function highlight(skill: string | null) {
  scrollState.hover.clear();
  if (skill) {
    for (const p of projects) if (p.skills.includes(skill)) scrollState.hover.add(p.id);
  }
  scrollState.invalidate();
}

export default function SkillsList() {
  return (
    <div className="mt-10 grid max-w-3xl gap-x-12 gap-y-8 sm:grid-cols-2">
      {Object.entries(profile.skills).map(([group, items]) => (
        <div key={group} className="border-t border-line pt-4">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-semibold">{group}</h3>
            <span className="mono-label">{String(items.length).padStart(2, "0")}</span>
          </div>
          <ul className="flex flex-wrap gap-2">
            {items.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  className="chip"
                  onMouseEnter={() => highlight(s)}
                  onMouseLeave={() => highlight(null)}
                  onFocus={() => highlight(s)}
                  onBlur={() => highlight(null)}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
