"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({
  rating,
  maxRating = 5,
  interactive = false,
  onChange,
  size = "md",
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const handleClick = (newRating: number) => {
    if (interactive && onChange) {
      onChange(newRating);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, index) => {
        const starNumber = index + 1;
        const isFilled = starNumber <= rating;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(starNumber)}
            disabled={!interactive}
            className={`
              ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}
              ${!interactive && "pointer-events-none"}
            `}
            aria-label={`${starNumber} star${starNumber > 1 ? "s" : ""}`}
          >
            <Star
              className={`
                ${sizeClasses[size]}
                ${isFilled ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-300"}
                ${interactive && "hover:fill-yellow-300"}
              `}
            />
          </button>
        );
      })}
      {!interactive && (
        <span className="ml-2 text-sm text-gray-600 font-medium">
          {rating} / {maxRating}
        </span>
      )}
    </div>
  );
}
