export interface FunProject {
  id: string;
  cardTitle: string;
  category: string;
  teaser: string;
  url: string;
  bgColor: string;
  thumbnail?: string;
  wide?: boolean;
}

export const funProjects: FunProject[] = [
  {
    id: "where-to-eat",
    cardTitle: "Where to Eat?",
    category: "Interactive App · Built with React",
    teaser:
      "A restaurant bracket game — pick your city, cuisine & budget, then swipe through 8 restaurants to settle tonight's dinner debate.",
    url: "https://where-to-eat-nu.vercel.app/",
    bgColor: "#1e100a",
    thumbnail: "/images/where-to-eat-thumb.png",
  },
  {
    id: "stampbook",
    cardTitle: "Stampbook",
    category: "Responsive Web App · Built with React",
    teaser:
      "Explore cities, complete real-world photo quests, and collect stamps of your adventures.",
    url: "https://stampbook-rho.vercel.app/",
    bgColor: "#1a1e10",
    thumbnail: "/images/stampbook-thumb.png",
    wide: true,
  },
];
