export interface HeroLocation {
  id: string;
  label: string;
  year: string;
  video: string;
  videoMobile: string;
  poster: string;
  alt: string;
}

export const HERO_LOCATIONS: HeroLocation[] = [
  {
    id: "cozumel",
    label: "Cozumel, Mexico",
    year: "2021",
    video: "/videos/hero/cozumel.mp4",
    videoMobile: "/videos/hero/cozumel-mobile.mp4",
    poster: "/images/hero/cozumel-poster.jpg",
    alt: "Aerial drone footage along a turquoise coastal road in Cozumel, Mexico",
  },
  {
    id: "wisconsin",
    label: "Maiden Rock Bluff, WI",
    year: "2021",
    video: "/videos/hero/wisconsin.mp4",
    videoMobile: "/videos/hero/wisconsin-mobile.mp4",
    poster: "/images/hero/wisconsin-poster.jpg",
    alt: "Aerial drone footage over autumn bluffs along the Mississippi River in Wisconsin",
  },
  {
    id: "rush-lake",
    label: "Rush Lake, MN",
    year: "2021",
    video: "/videos/hero/rushlake.mp4",
    videoMobile: "/videos/hero/rushlake-mobile.mp4",
    poster: "/images/hero/rushlake-poster.jpg",
    alt: "Aerial drone footage of a speedboat cutting across the water, dissolving into a sunset over Rush Lake, Minnesota",
  },
  {
    id: "saint-croix",
    label: "Saint Croix, MN",
    year: "2023",
    video: "/videos/hero/saintcroix.mp4",
    videoMobile: "/videos/hero/saintcroix-mobile.mp4",
    poster: "/images/hero/saintcroix-poster.jpg",
    alt: "Aerial drone footage following the Saint Croix River gorge past kayakers in Minnesota",
  },
  {
    id: "saint-paul",
    label: "Saint Paul, MN",
    year: "2021",
    video: "/videos/hero/saintpaul.mp4",
    videoMobile: "/videos/hero/saintpaul-mobile.mp4",
    poster: "/images/hero/saintpaul-poster.jpg",
    alt: "Aerial drone footage of the Mississippi River bend at golden hour with the Saint Paul, Minnesota skyline",
  },
  {
    id: "playa-del-carmen",
    label: "Playa del Carmen, Mexico",
    year: "2021",
    video: "/videos/hero/playadelcarmen.mp4",
    videoMobile: "/videos/hero/playadelcarmen-mobile.mp4",
    poster: "/images/hero/playadelcarmen-poster.jpg",
    alt: "Aerial drone footage over a turquoise coastline, dissolving into a rocky cove, in Playa del Carmen, Mexico",
  },
  {
    id: "kyiv",
    label: "Kyiv, Ukraine",
    year: "2021",
    video: "/videos/hero/kyiv.mp4",
    videoMobile: "/videos/hero/kyiv-mobile.mp4",
    poster: "/images/hero/kyiv-poster.jpg",
    alt: "Aerial drone footage descending toward a bridge over the Dnipro River, dissolving into colorful apartment rooftops, in Kyiv, Ukraine",
  },
  {
    id: "tokyo",
    label: "Tokyo, Japan",
    year: "2024",
    video: "/videos/hero/tokyo.mp4",
    videoMobile: "/videos/hero/tokyo-mobile.mp4",
    poster: "/images/hero/tokyo-poster.jpg",
    alt: "Footage of sunlight through a tree canopy, flowering branches against the skyline, and a lotus bud around Tokyo, Japan",
  },
];
