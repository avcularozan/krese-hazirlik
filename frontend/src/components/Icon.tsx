import type { SVGProps } from "react";

const PATHS: Record<string, string> = {
  home: "M4 11.5 12 4l8 7.5M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9",
  sprout: "M12 21v-8m0 0c0-4-3-6-7-6 0 4 2 7 7 6Zm0 0c0-5 3-7 7-7 0 4.5-2.5 7.5-7 7Z",
  dice: "M5 5h14v14H5V5Zm3.5 3.5h.01M15.5 8.5h.01M12 12h.01M8.5 15.5h.01M15.5 15.5h.01",
  chart: "M4 20V10m6 10V4m6 16v-7m6 7V8",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0",
  check: "m5 12 5 5L20 7",
  chevronDown: "m6 9 6 6 6-6",
  chevronUp: "m18 15-6-6-6 6",
  arrowLeft: "M19 12H5m0 0 6 6m-6-6 6-6",
  plus: "M12 5v14M5 12h14",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m6 14 5-5-5-5m5 5H9",
  download: "M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2",
  trash: "M4 7h16M9 7V4h6v3m-8 0 1 13a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-13",
  link: "M9 15l6-6m-5-1 1.5-1.5a3.5 3.5 0 1 1 5 5L15 13m-9 0-1.5 1.5a3.5 3.5 0 1 0 5 5L11 18",
  clock: "M12 7v5l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  sparkle: "M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6",
  info: "M12 16v-4m0-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  calendar: "M8 3v4m8-4v4M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z",
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: keyof typeof PATHS;
  size?: number;
}

export function Icon({ name, size = 22, strokeWidth = 1.8, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
