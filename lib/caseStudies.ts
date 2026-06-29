export interface CaseStudy {
  id: string;
  title: string;
  cardTitle: string;
  category: string;
  teaser: string;
  slug: string;
  status: "published" | "in-progress";
  bgColor: string;
  thumbnail?: string;
}

export const caseStudies: CaseStudy[] = [
  {
    id: "ai-search",
    title: "Complex Search Made Easy",
    cardTitle: "Complex Search Made Easy",
    category: "AI · Search UX",
    teaser: "Simplifying complex query building with an AI-powered search experience.",
    slug: "/work/ai-search",
    status: "published",
    bgColor: "#d1ccc3",
    thumbnail: "/images/ai-search-thumb.png",
  },
  {
    id: "safeeats",
    title: "SafeEats",
    cardTitle: "User Awareness Where It Matters the Most",
    category: "Consumer · User Research",
    teaser: "Responsive food recall platform built based on user research and iterative testing.",
    slug: "/work/safeeats",
    status: "published",
    bgColor: "#8c9e87",
    thumbnail: "/images/safeeats-thumb.png",
  },
];
