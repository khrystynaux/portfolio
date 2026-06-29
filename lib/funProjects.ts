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
      "A bracket-style game that settles the age-old dinner debate — where to eat tonight?",
    url: "https://where-to-eat-nu.vercel.app/",
    bgColor: "#1e100a",
    thumbnail: "/images/where-to-eat-thumb.png",
  },
  {
    id: "stampbook",
    cardTitle: "Stampbook",
    category: "Responsive Web App · Built with React",
    teaser:
      "Animal Crossing–inspired web app that allows players to explore cities, complete real-world photo quests, and collect stamps of your adventures.",
    url: "https://stampbook-rho.vercel.app/",
    bgColor: "#1a1e10",
    thumbnail: "/images/stampbook-thumb.png",
    wide: true,
  },
];
