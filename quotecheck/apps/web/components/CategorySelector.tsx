'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface Category {
  slug: string;
  name: string;
  description: string;
}

interface CategorySelectorProps {
  categories: Category[];
  onSelect?: (slug: string) => void;
}

export default function CategorySelector({ categories, onSelect }: CategorySelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <Card 
          key={category.slug}
          className="h-32 hover:shadow-lg transition-all cursor-pointer group border-2 border-transparent hover:border-primary-200"
          onClick={() => onSelect?.(category.slug)}
        >
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-lg font-bold group-hover:text-primary-600 transition-colors">
              {category.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-gray-600">
            {category.description}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}