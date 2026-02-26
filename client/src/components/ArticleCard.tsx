import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ExternalLink } from "lucide-react";

interface ArticleCardProps {
  title: string;
  date: string;
  section: string;
  summary: string;
  url: string;
}

/**
 * ArticleCard Component
 * Design: Minimalist Corporate
 * - White card with subtle shadow (0 4px 12px rgba(0,0,0,0.08))
 * - Blue badge for section
 * - Green checkmark for visual confirmation
 * - Hover: elevation effect + color change
 */
export default function ArticleCard({
  title,
  date,
  section,
  summary,
  url,
}: ArticleCardProps) {
  return (
    <Card className="group relative overflow-hidden bg-white p-6 hover:shadow-lg transition-all duration-200 border border-gray-100">
      {/* Background accent on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/0 group-hover:from-blue-50/50 group-hover:to-transparent transition-all duration-300 pointer-events-none" />

      <div className="relative z-10">
        {/* Header with badge */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="flex-1 text-lg font-bold text-gray-900 leading-tight pr-2 group-hover:text-blue-600 transition-colors duration-200">
            {title}
          </h3>
          <Badge
            className="flex-shrink-0 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            variant="default"
          >
            {section}
          </Badge>
        </div>

        {/* Date and metadata */}
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
          <span>{date}</span>
          <span className="text-gray-300">•</span>
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        </div>

        {/* Summary */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
          {summary}
        </p>

        {/* Footer with link */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200 group/link"
        >
          Ler artigo completo
          <ExternalLink className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </Card>
  );
}
