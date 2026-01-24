import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Minus, Plus, X } from "lucide-react"
import { SelectedItem } from "@/types"

export function SelectedItems({ selectedItems, removeItem, updateQuantity }: { selectedItems: SelectedItem[], removeItem: (index: number) => void, updateQuantity: (index: number, delta: number) => void }) {
  return (

    <div className="space-y-3 mt-4">
      <AnimatePresence>
        {selectedItems.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border bg-muted/50"
          >
            <span className="text-sm font-medium text-foreground">{item.name}</span>
            <div className="flex items-center gap-3 mt-2 sm:mt-0">
              <div className="flex items-center bg-background rounded-md border shadow-sm">
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 rounded-r-none hover:text-destructive" onClick={() => updateQuantity(index, -1)}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center text-xs font-mono">{item.quantity}</span>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 rounded-l-none hover:text-primary" onClick={() => updateQuantity(index, 1)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full" onClick={() => removeItem(index)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {selectedItems.length === 0 && (
        <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed rounded-lg">No items added yet.</div>
      )}
    </div>
  )
}

