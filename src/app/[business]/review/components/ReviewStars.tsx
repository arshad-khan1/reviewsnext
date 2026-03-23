"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface ReviewStarsProps {
  onRate: (rating: number) => void;
}

const ReviewStars = ({ onRate }: ReviewStarsProps) => {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);

  const handleClick = (rating: number) => {
    setSelected(rating);
    onRate(rating);
  };

  return (
    <div className="flex gap-2 justify-center">
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= (hovered || selected);
        return (
          <motion.button
            key={star}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => handleClick(star)}
            className="p-1 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              size={44}
              className={`transition-colors duration-150 ${
                isActive
                  ? "fill-star text-star"
                  : "fill-transparent text-star-inactive"
              }`}
            />
          </motion.button>
        );
      })}
    </div>
  );
};

export default ReviewStars;
