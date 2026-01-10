import { useState, useMemo } from "react";
import { Search } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export interface ItemOption {
  name: string;
  description: string;
}
export function ItemsList({ items, addItem }: { items: ItemOption[]; addItem: (itemName: string) => void }) {
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    return items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
  }, [items, search]);

  return (
    <div className="space-y-3">
      <Label>Select Items to Carry</Label>
      <div className="flex items-center gap-2 mb-2">
        <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="max-h-64 overflow-y-auto border rounded-md bg-background p-2 space-y-1">
        {filteredItems.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-2">No items found.</div>
        ) : (
          filteredItems.map((item) => (
            <button key={item.name} type="button" className="w-full text-left p-2 rounded hover:bg-primary/10 flex flex-col sm:flex-row sm:justify-between sm:items-center" onClick={() => addItem(item.name)}>
              <span className="font-medium">{item.name}</span>
              <span className="text-xs text-muted-foreground mt-1 sm:mt-0">{item.description}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
