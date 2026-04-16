import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";

type PreviewRow = {
  id: string;
  name: string;
  fee: number;
  currentCredit: number;
  afterCredit: number;
};

export function SessionPreviewTable({ rows }: { rows: PreviewRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Player</TableHead>
          <TableHead>Fee</TableHead>
          <TableHead>Current credit</TableHead>
          <TableHead>Credit after deduction</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.name}</TableCell>
            <TableCell>{formatCurrency(row.fee)}</TableCell>
            <TableCell>{formatCurrency(row.currentCredit)}</TableCell>
            <TableCell>{formatCurrency(row.afterCredit)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
