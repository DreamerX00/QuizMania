import React, { useRef, useState, memo } from "react";
import Folder from "./Folder";
import { BookOpen } from "lucide-react";
import Image from "next/image";

interface PackageCardProps {
  pkg: {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    quizIds: string[];
    createdAt: string;
    quizThumbnails?: { imageUrl?: string; title: string }[];
    isPublished?: boolean;
    price?: number;
  };
  onSelect: (pkg: any) => void;
  hideImage?: boolean;
}

const PackageCard = memo(function PackageCard({
  pkg,
  onSelect,
  hideImage,
}: PackageCardProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [showHint, setShowHint] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);

  // Check if title is truncated after mount
  React.useEffect(() => {
    if (titleRef.current) {
      setIsTruncated(
        titleRef.current.scrollWidth > titleRef.current.clientWidth
      );
    }
  }, [pkg.title]);

  // Prepare quiz thumbnails for the folder papers
  const quizThumbs = (pkg.quizThumbnails || []).slice(0, 3).map((quiz, i) =>
    quiz.imageUrl ? (
      <div key={i} className="relative w-10 h-8">
        <Image
          src={quiz.imageUrl}
          alt={quiz.title}
          fill
          className="object-cover rounded-md"
          sizes="40px"
        />
      </div>
    ) : (
      <span
        key={i}
        className="flex items-center justify-center w-full h-full text-gray-400"
      >
        <BookOpen size={24} />
      </span>
    )
  );

  return (
    <div
      className={`relative flex flex-col items-center justify-center cursor-pointer hover:scale-[1.04] transition-all duration-200 p-4`}
      onClick={() => onSelect(pkg)}
      onMouseEnter={() => isTruncated && setShowHint(true)}
      onMouseLeave={() => setShowHint(false)}
    >
      {/* Unpublished badge */}
      {pkg.isPublished === false && (
        <span className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded shadow z-10">
          Unpublished
        </span>
      )}
      {/* Hintbox for truncated title */}
      {showHint && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs px-3 py-1 rounded shadow-lg z-50 whitespace-nowrap border border-white/10 pointer-events-none">
          {pkg.title}
        </div>
      )}
      <Folder size={hideImage ? 0.7 : 1} items={quizThumbs} />
      <div className="mt-3 text-center w-full">
        <h3
          ref={titleRef}
          className="text-base font-semibold text-gray-900 dark:text-white/90 truncate max-w-[140px] mx-auto"
          style={{ direction: "ltr" }}
        >
          {pkg.title}
        </h3>
        {/* Price Badge */}
        <div className="mt-2">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
              pkg.price === 0 || !pkg.price
                ? "bg-green-500/20 text-green-700 dark:text-green-400"
                : "bg-blue-500/20 text-blue-700 dark:text-blue-400"
            }`}
          >
            {pkg.price === 0 || !pkg.price
              ? "Free"
              : `₹${Math.floor(pkg.price / 100)}`}
          </span>
        </div>
      </div>
    </div>
  );
});

export default PackageCard;

