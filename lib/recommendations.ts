export interface Recommendation {
  id: string;
  quote: string;
  name: string;
  title: string;
}

export const recommendations: Recommendation[] = [
  {
    id: "colm-duffy",
    quote:
      "Khrystyna is deeply focused on delivering quality work and consistently goes the extra mile to ensure the right designs reach end users. Her unfailing attention to detail means her work often lands well with minimal review cycles... She's also a generous collaborator — always approachable, quick to answer questions, and just as willing to ask thoughtful ones that help the whole team think more clearly.",
    name: "Colm Duffy",
    title: "Software Architect",
  },
  {
    id: "kinza-arif",
    quote:
      "Working closely with Khrystyna for the past four years has been an absolute highlight of my career. As a Senior Product Designer, she possesses a rare ability to take incredibly chaotic, complex product requirements and distill them into elegant, intuitive, and user-friendly experiences... Beyond her exceptional talent, Khrystyna is a phenomenal leader and teammate... Her growth mindset and collaborative spirit elevate everyone around her. Any product team would be incredibly lucky to have her.",
    name: "Kinza Arif",
    title: "Senior Product Designer",
  },
  {
    id: "blanca-massot-gonzalez",
    quote:
      "In a typical product model, a designer receives requirements and translates them into visual solutions. That is not what happens here: Khrystyna participates as a co-definer of product direction. Her focus isn't UI, it's UX: she is part of the process that collects feedback from stakeholders and users, validates it, and supports identifying how to turn that feedback into actionable items that translate into a better experience overall... she brings deep UX expertise into decisions that shape not just how things look, but what we build, why we build it, and what comes next.",
    name: "Blanca Massot Gonzalez",
    title: "Senior Director, Product Definition and Deployment",
  },
];
