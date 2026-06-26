export interface FunProject {
  id: string;
  cardTitle: string;
  category: string;
  teaser: string;
  url: string;
  bgColor: string;
  thumbnail?: string;
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
];
