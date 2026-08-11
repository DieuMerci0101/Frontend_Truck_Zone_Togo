"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { API_URL } from "@/constants";
import { mediaUrl } from "@/lib/media";

type AvatarSize = "sm" | "md" | "lg";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  /**
   * Version du média (ex: `user.photo_profil_version`) utilisée comme
   * cache-buster : `src? v=<version>`. Force le navigateur à recharger
   * l'image dès qu'elle change en base.
   */
  version?: number | string | null;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function resolvePhotoUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/uploads/")) return `${API_URL}${src}`;
  return src;
}

function Avatar({
  className,
  src,
  alt,
  name = "",
  size = "md",
  version,
  ...props
}: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);
  const resolved = mediaUrl(resolvePhotoUrl(src), version);
  const showImage = resolved && !imgError;

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {showImage ? (
        <img
          src={resolved}
          alt={alt || name}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="font-medium text-gray-600">
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}

export { Avatar };
