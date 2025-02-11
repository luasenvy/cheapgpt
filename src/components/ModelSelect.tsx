import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ModelSelectProps extends React.HTMLAttributes<HTMLDivElement> {
  model: string;
  onModelSelect: (value: string) => void;
}

export function ModelSelect({
  model,
  onModelSelect: handleModelSelect,
  ...props
}: ModelSelectProps) {
  return (
    <div {...props}>
      <Select value={model} onValueChange={handleModelSelect}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="gpt-4o">gpt-4o</SelectItem>
          <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
          <SelectItem value="o1-preview">o1-preview</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
