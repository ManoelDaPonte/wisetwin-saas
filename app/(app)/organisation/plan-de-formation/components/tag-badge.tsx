import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagBadgeProps {
  name: string;
  color?: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  size?: "sm" | "default" | "lg";
  showCount?: number;
  className?: string;
}

export function TagBadge({ 
  name, 
  color = "#3B82F6", 
  variant = "default",
  size = "default",
  showCount,
  className 
}: TagBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    default: "text-sm px-2.5 py-0.5",
    lg: "text-sm px-3 py-1",
  };

  // Style avec couleur personnalisée pour les tags colorés
  const customStyle = variant === "default" && color ? {
    backgroundColor: `${color}20`, // 20% d'opacité
    borderColor: color,
    color: color,
  } : undefined;

  return (
    <Badge
      variant={variant}
      className={cn(
        sizeClasses[size],
        "inline-flex items-center gap-1 font-medium border",
        className
      )}
      style={customStyle}
    >
      {/* Petit point coloré à côté du nom */}
      {variant === "default" && color && (
        <span 
          className="w-2 h-2 rounded-full flex-shrink-0" 
          style={{ backgroundColor: color }}
        />
      )}
      <span className="truncate">{name}</span>
      {typeof showCount === 'number' && (
        <span className="text-xs opacity-75">
          ({showCount})
        </span>
      )}
    </Badge>
  );
}