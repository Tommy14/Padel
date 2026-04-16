import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";

type CreditBadgeProps = {
  amount: number;
};

export function CreditBadge({ amount }: CreditBadgeProps) {
  return (
    <Badge variant={amount > 0 ? "success" : "destructive"}>
      {amount > 0 ? "Credit" : "Low credit"}: {formatCurrency(amount)}
    </Badge>
  );
}
