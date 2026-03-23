"use client";

interface DetailRowProps {
  label: string;
  value: string;
}

const DetailRow = ({ label, value }: DetailRowProps) => (
  <div className="flex justify-between items-start gap-4 py-2 border-b border-border last:border-0">
    <span className="text-muted-foreground font-medium shrink-0">{label}</span>
    <span className="text-foreground text-right">{value}</span>
  </div>
);

export default DetailRow;
