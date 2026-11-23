import { caseStudies } from "./caseStudies";

export type VendingAction =
  | { type: "navigate"; href: string }
  | { type: "download"; href: string; filename: string };

export interface VendingItem {
  id: string;
  /** Large title printed on the front of the carton, in capitals */
  title: string;
  /** Short descriptor printed under the title */
  tagline: string;
  /** Small line at the top of the label */
  brand: string;
  /** Uppercase name printed on the tag under the carton */
  short: string;
  color: string;
  action: VendingAction;
}

const study = (id: string) => {
  const s = caseStudies.find((c) => c.id === id);
  if (!s) throw new Error(`Unknown case study: ${id}`);
  return s;
};

const caseStudyItem = (id: string, title: string, tagline: string): VendingItem => {
  const s = study(id);
  return {
    id: s.id,
    title,
    tagline,
    brand: "Case Study",
    short: title,
    color: s.bgColor,
    action: { type: "navigate", href: s.slug },
  };
};

/** Rows top → bottom, 3 columns each — every slot links to real content */
export const vendingRows: VendingItem[][] = [
  [
    caseStudyItem("ai-workflow", "DESIGN & AI", "Creating more UX space"),
    caseStudyItem("ai-search", "ADVANCED SEARCH", "Complex search made to be easy"),
    caseStudyItem("safeeats", "SAFEEATS", "Consumer-facing recalls website"),
  ],
  [
    {
      id: "about",
      title: "ABOUT ME",
      tagline: "My story as a designer",
      // Tools & stack and recommendations live on the About page too
      brand: "Khrystyna",
      short: "ABOUT ME",
      color: "#ebcda2",
      action: { type: "navigate", href: "/about" },
    },
    {
      id: "resume",
      title: "RESUME",
      tagline: "Download my resume",
      brand: "Download",
      short: "RESUME",
      color: "#f6f5e3",
      action: { type: "download", href: "/resume.pdf", filename: "Khrystyna-Arnoldy-Resume.pdf" },
    },
    {
      id: "fun",
      title: "SIDE PROJECTS",
      tagline: "Built for fun",
      brand: "Side Projects",
      short: "SIDE PROJECTS",
      color: "#e8a87c",
      action: { type: "navigate", href: "/fun" },
    },
  ],
];
