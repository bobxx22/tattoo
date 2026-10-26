type IconProps = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "square" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

export const ArrowUpRight = ({ className = "size-6" }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

export const ArrowDown = ({ className = "size-4" }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M12 4v16M6 14l6 6 6-6" />
  </svg>
);

export const Close = ({ className = "size-6" }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M5 5l14 14M19 5 5 19" />
  </svg>
);

export const Plus = ({ className = "size-5" }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const Check = ({ className = "size-4" }: IconProps) => (
  <svg {...base} strokeWidth={2} className={className}>
    <path d="M5 12.5 10 17 19 7" />
  </svg>
);

export const ChevronLeft = ({ className = "size-6" }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

export const ChevronRight = ({ className = "size-6" }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M9 5l7 7-7 7" />
  </svg>
);
