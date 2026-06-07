import { SiFigma, SiMaze, SiAnthropic, SiGithub } from "react-icons/si";
import { TbBrandAdobeXd } from "react-icons/tb";
import { VscAzureDevops } from "react-icons/vsc";
import type { IconType } from "react-icons";
import type { JSX } from "react";


function SharePointIcon({ size = 20 }: { size?: number | string }): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      {/* SharePoint — "S" mark inside a circle */}
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1.25 14.5H9a.75.75 0 0 1 0-1.5h4.25c.69 0 1.25-.56 1.25-1.25S13.94 12.5 13.25 12.5H11c-1.52 0-2.75-1.23-2.75-2.75S9.48 7 11 7h3.5a.75.75 0 0 1 0 1.5H11c-.69 0-1.25.56-1.25 1.25S10.31 11 11 11h2.25c1.52 0 2.75 1.23 2.75 2.75S14.77 16.5 13.25 16.5z" />
    </svg>
  );
}

export type ToolCategory = "Design" | "Research" | "Development" | "Collaboration";

export interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  Icon: IconType | (({ size }: { size?: number | string }) => JSX.Element);
  iconStyle?: "stroke" | "fill";
}

export const tools: Tool[] = [
  // Design
  { id: "figma",       name: "Figma",        category: "Design",         Icon: SiFigma,           iconStyle: "fill"   },
  { id: "adobexd",     name: "Adobe XD",     category: "Design",         Icon: TbBrandAdobeXd,    iconStyle: "stroke" },
  // Research
  { id: "maze",        name: "Maze",          category: "Research",       Icon: SiMaze,            iconStyle: "fill"   },
  // Development & AI
  { id: "claude",      name: "Claude Code",  category: "Development",    Icon: SiAnthropic,       iconStyle: "fill"   },
  { id: "github",      name: "GitHub",       category: "Development",    Icon: SiGithub,          iconStyle: "fill"   },
  // Collaboration
  { id: "azuredevops", name: "Azure DevOps", category: "Collaboration",  Icon: VscAzureDevops,    iconStyle: "fill"   },
  { id: "sharepoint",  name: "SharePoint",   category: "Collaboration",  Icon: SharePointIcon,    iconStyle: "fill"   },
];

export const categories: ToolCategory[] = ["Design", "Research", "Development", "Collaboration"];
