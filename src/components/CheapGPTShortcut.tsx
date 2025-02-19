import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function CheapGPTShortcut() {
  return (
    <div className="flex flex-col space-y-4">
      <Table>
        <TableCaption>A list of keyboard shortcuts.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Feature</TableHead>
            <TableHead className="w-[100px]">focus</TableHead>
            <TableHead className="w-[200px]">Shortcut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-semibold" colSpan={2}>
              Open Extension Panel
            </TableCell>
            <TableCell>
              <code>Ctrl + Shift + E</code>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="font-semibold">Clear Messages</TableCell>
            <TableCell>on input</TableCell>
            <TableCell>
              <code>Ctrl + Shift + L</code>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="font-semibold">Summary Current Page</TableCell>
            <TableCell>on input</TableCell>
            <TableCell>
              <code>Ctrl + Shift + F</code>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="font-semibold">Generate Image</TableCell>
            <TableCell>on input</TableCell>
            <TableCell>
              <code>Ctrl + Shift + Y</code>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <p className="text-base"></p>
    </div>
  );
}
