"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewStarsProps {
  onRate: (rating: number) => void;
  onHoverChange?: (rating: number) => void;
}

const ReviewStars = ({ onRate, onHoverChange }: ReviewStarsProps) => {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    onHoverChange?.(hovered);
  }, [hovered, onHoverChange]);

  const handleClick = (rating: number) => {
    setSelected(rating);
    onRate(rating);
  };

  return (
    <div className="flex gap-1.5 justify-center py-2">
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= (hovered || selected);
        const isHovered = star <= hovered;

        return (
          <motion.button
            key={star}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => handleClick(star)}
            className="p-1 rounded-full transition-all focus:outline-none cursor-pointer"
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              size={36}
              strokeWidth={1}
              className={cn(
                "transition-all duration-300 ease-out",
                isActive
                  ? "fill-(--brand-primary) text-(--brand-primary)"
                  : "fill-transparent text-muted-foreground/20",
                isHovered && !selected && "opacity-70",
              )}
            />
          </motion.button>
        );
      })}
    </div>
  );
};

export default ReviewStars;
