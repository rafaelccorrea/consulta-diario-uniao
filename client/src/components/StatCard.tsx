import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  color?: "blue" | "green" | "cyan" | "purple";
}

/**
 * StatCard Component
 * Design: Minimalist Corporate
 * - White card with subtle shadow
 * - Large blue number
 * - Icon with color accent
 * - Hover: scale and shadow effect
 */
export default function StatCard({
  icon: Icon,
  value,
  label,
  color = "blue",
}: StatCardProps) {
  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    cyan: "text-cyan-600",
    purple: "text-purple-600",
  };

  return (
    <Card className="group relative overflow-hidden bg-white p-6 hover:shadow-lg hover:scale-105 transition-all duration-200 border border-gray-100">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/0 group-hover:from-blue-50/30 group-hover:to-transparent transition-all duration-300 pointer-events-none" />

      <div className="relative z-10">
        {/* Icon */}
        <div className="mb-4">
          <Icon className={`w-8 h-8 ${colorClasses[color]}`} />
        </div>

        {/* Value */}
        <div className="mb-2">
          <p className="text-4xl font-bold text-blue-600">
            {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
          </p>
        </div>

        {/* Label */}
        <p className="text-gray-600 text-sm font-medium">{label}</p>
      </div>
    </Card>
  );
}
