
"use client"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { HACKATHON_DIFFICULTIES, HACKATHON_LOCATIONS, HACKATHON_MODES, HACKATHON_PRIZE_RANGES, HACKATHON_SOURCES, HACKATHON_THEMES } from "@/lib/constants"
import { Card, CardContent } from "./ui/card"
import { DateRangePicker } from "./ui/date-range-picker"
import { Button } from "./ui/button"

export type FilterState = {
  modes: string[];
  locations: string[];
  prizes: string[];
  themes: string[];
  difficulties: string[];
  sources: string[];
}

type FilterProps = {
  filters: FilterState;
  onFilterChange: (filterType: keyof FilterState, value: string) => void;
  clearFilters: () => void;
}

const FilterSection = ({ title, items, selectedItems, filterType, onFilterChange }: {
  title: string;
  items: readonly string[];
  selectedItems: string[];
  filterType: keyof FilterState;
  onFilterChange: FilterProps['onFilterChange'];
}) => (
  <AccordionItem value={filterType}>
    <AccordionTrigger className="text-base">{title}</AccordionTrigger>
    <AccordionContent>
      <div className="grid gap-2">
        {items.map((item) => (
          <div key={item} className="flex items-center space-x-2">
            <Checkbox
              id={`${filterType}-${item}`}
              checked={selectedItems.includes(item)}
              onCheckedChange={() => onFilterChange(filterType, item)}
            />
            <Label htmlFor={`${filterType}-${item}`} className="font-normal">{item}</Label>
          </div>
        ))}
      </div>
    </AccordionContent>
  </AccordionItem>
);


export function Filters({ filters, onFilterChange, clearFilters }: FilterProps) {
  return (
    <Card className="sticky top-20">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold font-headline">Filters</h3>
            <Button variant="ghost" size="sm" onClick={clearFilters}>Clear All</Button>
        </div>
        <Accordion type="multiple" defaultValue={['modes', 'locations', 'prizes']} className="w-full">
            <FilterSection
              title="Mode"
              items={HACKATHON_MODES}
              selectedItems={filters.modes}
              filterType="modes"
              onFilterChange={onFilterChange}
            />
            <FilterSection
              title="Location"
              items={HACKATHON_LOCATIONS}
              selectedItems={filters.locations}
              filterType="locations"
              onFilterChange={onFilterChange}
            />
            <FilterSection
              title="Prize Range"
              items={HACKATHON_PRIZE_RANGES}
              selectedItems={filters.prizes}
              filterType="prizes"
              onFilterChange={onFilterChange}
            />
             <FilterSection
              title="Theme"
              items={HACKATHON_THEMES}
              selectedItems={filters.themes}
              filterType="themes"
              onFilterChange={onFilterChange}
            />
            <FilterSection
              title="Difficulty"
              items={HACKATHON_DIFFICULTIES}
              selectedItems={filters.difficulties}
              filterType="difficulties"
              onFilterChange={onFilterChange}
            />
          {/*
           <AccordionItem value="date">
            <AccordionTrigger className="text-base">Date Range</AccordionTrigger>
            <AccordionContent>
                <DateRangePicker />
            </AccordionContent>
          </AccordionItem>
          */}
           <FilterSection
              title="Source"
              items={HACKATHON_SOURCES}
              selectedItems={filters.sources}
              filterType="sources"
              onFilterChange={onFilterChange}
            />
        </Accordion>
      </CardContent>
    </Card>
  )
}
