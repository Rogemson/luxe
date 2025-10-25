'use client'

import { useState } from 'react'
import { X, SlidersHorizontal } from 'lucide-react'
import { useFilters } from '@/context/filters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ProductFiltersProps {
  categories: string[]
  maxPrice: number
}

export function ProductFilters({ categories, maxPrice }: ProductFiltersProps) {
  const { filters, setFilters, resetFilters } = useFilters()
  const [isOpen, setIsOpen] = useState(false)
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(filters.priceRange)

  const handlePriceChange = (value: number, index: 0 | 1) => {
    const newRange: [number, number] = [...filters.priceRange]
    newRange[index] = value
    setFilters({ ...filters, priceRange: newRange })
    setLocalPriceRange(newRange)
  }

  const handleSliderChange = (value: [number, number]) => {
    setLocalPriceRange(value)
  }

  const handleSliderCommit = (value: [number, number]) => {
    setFilters({ ...filters, priceRange: value })
  }

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category]
    setFilters({ ...filters, categories: newCategories })
  }

  const handleStockToggle = (value: string) => {
    const stockValue = value === 'all' ? null : value === 'in-stock'
    setFilters({ ...filters, inStock: stockValue })
  }

  return (
    <>
      {/* Mobile Filter Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 rounded-full h-14 w-14 p-0 shadow-lg"
        size="icon"
      >
        <SlidersHorizontal className="w-6 h-6" />
      </Button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 bg-card border border-border p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-sans font-semibold mb-6">Filters</h2>
          <div className="space-y-6">
            {/* Sort */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Sort By</Label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    sortBy: value as typeof filters.sortBy,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Price Range</Label>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="min-price" className="text-xs mb-1 block">
                      Min
                    </Label>
                    <Input
                      id="min-price"
                      type="number"
                      value={filters.priceRange[0]}
                      onChange={(e) => handlePriceChange(Number(e.target.value), 0)}
                      min={0}
                      max={maxPrice}
                      placeholder="0"
                    />
                  </div>
                  <span className="text-muted-foreground pt-6">-</span>
                  <div className="flex-1">
                    <Label htmlFor="max-price" className="text-xs mb-1 block">
                      Max
                    </Label>
                    <Input
                      id="max-price"
                      type="number"
                      value={filters.priceRange[1]}
                      onChange={(e) => handlePriceChange(Number(e.target.value), 1)}
                      min={0}
                      max={maxPrice}
                      placeholder={maxPrice.toString()}
                    />
                  </div>
                </div>
                
                <div className="pt-2">
                  <Slider
                    value={localPriceRange}
                    onValueChange={(value) => handleSliderChange(value as [number, number])}
                    onValueCommit={(value) => handleSliderCommit(value as [number, number])}
                    min={0}
                    max={maxPrice}
                    step={10}
                    minStepsBetweenThumbs={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>${localPriceRange[0]}</span>
                    <span>${localPriceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Categories</Label>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={filters.categories.includes(category)}
                      onCheckedChange={() => handleCategoryToggle(category)}
                    />
                    <Label
                      htmlFor={`category-${category}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Availability</Label>
              <RadioGroup
                value={
                  filters.inStock === null
                    ? 'all'
                    : filters.inStock
                    ? 'in-stock'
                    : 'out-of-stock'
                }
                onValueChange={handleStockToggle}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="text-sm font-normal cursor-pointer">
                    All Products
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="in-stock" id="in-stock" />
                  <Label
                    htmlFor="in-stock"
                    className="text-sm font-normal cursor-pointer"
                  >
                    In Stock
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="out-of-stock" id="out-of-stock" />
                  <Label
                    htmlFor="out-of-stock"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Out of Stock
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Reset Button */}
            <Button onClick={resetFilters} variant="outline" className="w-full">
              Reset Filters
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-80 max-w-full bg-card shadow-xl p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Filters</h2>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
            <div className="space-y-6">
              {/* Sort */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Sort By</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      sortBy: value as typeof filters.sortBy,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Price Range</Label>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label htmlFor="min-price-mobile" className="text-xs mb-1 block">
                        Min
                      </Label>
                      <Input
                        id="min-price-mobile"
                        type="number"
                        value={filters.priceRange[0]}
                        onChange={(e) => handlePriceChange(Number(e.target.value), 0)}
                        min={0}
                        max={maxPrice}
                        placeholder="0"
                      />
                    </div>
                    <span className="text-muted-foreground pt-6">-</span>
                    <div className="flex-1">
                      <Label htmlFor="max-price-mobile" className="text-xs mb-1 block">
                        Max
                      </Label>
                      <Input
                        id="max-price-mobile"
                        type="number"
                        value={filters.priceRange[1]}
                        onChange={(e) => handlePriceChange(Number(e.target.value), 1)}
                        min={0}
                        max={maxPrice}
                        placeholder={maxPrice.toString()}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Slider
                      value={localPriceRange}
                      onValueChange={(value) => handleSliderChange(value as [number, number])}
                      onValueCommit={(value) => handleSliderCommit(value as [number, number])}
                      min={0}
                      max={maxPrice}
                      step={10}
                      minStepsBetweenThumbs={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>${localPriceRange[0]}</span>
                      <span>${localPriceRange[1]}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Categories</Label>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-mobile-${category}`}
                        checked={filters.categories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <Label
                        htmlFor={`category-mobile-${category}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Availability</Label>
                <RadioGroup
                  value={
                    filters.inStock === null
                      ? 'all'
                      : filters.inStock
                      ? 'in-stock'
                      : 'out-of-stock'
                  }
                  onValueChange={handleStockToggle}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all-mobile" />
                    <Label htmlFor="all-mobile" className="text-sm font-normal cursor-pointer">
                      All Products
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="in-stock" id="in-stock-mobile" />
                    <Label
                      htmlFor="in-stock-mobile"
                      className="text-sm font-normal cursor-pointer"
                    >
                      In Stock
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="out-of-stock" id="out-of-stock-mobile" />
                    <Label
                      htmlFor="out-of-stock-mobile"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Out of Stock
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Reset Button */}
              <Button onClick={resetFilters} variant="outline" className="w-full">
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}