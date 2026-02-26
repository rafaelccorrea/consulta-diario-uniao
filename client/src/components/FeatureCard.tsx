import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * FeatureCard Component
 * Design: Minimalist Corporate
 * - White card with subtle shadow
 * - Icon in blue
 * - Clear typography hierarchy
 * - Hover: subtle elevation
 */
export default function FeatureCard({
  icon: Icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <Card className="group relative overflow-hidden bg-white p-8 hover:shadow-lg transition-all duration-200 border border-gray-100">
      {/* Background accent on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/0 group-hover:from-blue-50/40 group-hover:to-transparent transition-all duration-300 pointer-events-none" />

      <div className="relative z-10">
        {/* Icon */}
        <div className="mb-4">
          <Icon className="w-10 h-10 text-blue-600" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </Card>
  );
}
