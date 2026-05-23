import { useState } from "react";
import type { CSSProperties, MouseEventHandler } from "react";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

const SIZES: Record<AvatarSize, { px: number; text: string }> = {
  sm: { px: 24, text: "text-[10px]" },
  md: { px: 32, text: "text-xs" },
  lg: { px: 48, text: "text-base" },
  xl: { px: 96, text: "text-3xl" },
};

interface AvatarProps {
  url?: string | null;
  name?: string | null;
  size?: AvatarSize;
  ring?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  ariaLabel?: string;
  className?: string;
}

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const letters = parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
  return letters || "?";
}

const Avatar = ({
  url,
  name,
  size = "md",
  ring = false,
  onClick,
  ariaLabel,
  className = "",
}: AvatarProps) => {
  const [imgFailed, setImgFailed] = useState(false);
  const { px, text } = SIZES[size];
  const initials = getInitials(name);
  const showImg = !!url && !imgFailed;

  const ringStyle: CSSProperties = ring
    ? {
        padding: 2,
        backgroundImage:
          "linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))",
      }
    : {};

  const inner: CSSProperties = {
    width: px,
    height: px,
    backgroundImage: showImg
      ? undefined
      : "linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))",
    color: "white",
  };

  const content = (
    <span
      className={`relative inline-flex items-center justify-center rounded-full font-bold ${text}`}
      style={inner}
    >
      {showImg ? (
        <img
          src={url!}
          alt={name ?? "avatar"}
          width={px}
          height={px}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  );

  const wrapperClasses = `inline-flex items-center justify-center rounded-full ${className}`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel ?? name ?? "avatar"}
        className={wrapperClasses}
        style={ringStyle}
      >
        {content}
      </button>
    );
  }

  return (
    <span
      aria-label={ariaLabel ?? name ?? "avatar"}
      className={wrapperClasses}
      style={ringStyle}
    >
      {content}
    </span>
  );
};

export default Avatar;
