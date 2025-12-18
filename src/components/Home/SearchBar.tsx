import { Input } from "@/components/ui/input";

export function SearchBar() {
  return (
    <div className="mb-8">
      <Input
        type="text"
        placeholder="Search for your captures"
        className="max-w-3xl bg-card border-border"
      />
    </div>
  );
}
