'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface PriceDisplayProps {
  low: number;
  typical: number;
  high: number;
  confidence: string;
  assumptions: string[];
  exclusions: string[];
  reasonBreakdown: string[];
}

export default function PriceDisplay({ 
  low, typical, high, confidence, assumptions, exclusions, reasonBreakdown 
}: PriceDisplayProps) {
  const formatPrice = (price: number) => `R${price.toLocaleString()}`;

  const confidenceColor = {
    high: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-orange-100 text-orange-800 border-orange-300'
  }[confidence as keyof typeof confidenceColor];

  return (
    <div className="space-y-6">
      {/* Price Bands */}
      <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
        <CardContent className="pt-8 pb-12">
          <div className="text-center mb-8">
            <Badge className={`text-lg px-4 py-2 ${confidenceColor}`}>
              {confidence.toUpperCase()} confidence
            </Badge>
          </div>
          
          <div className="space-y-4">
            <div className="text-4xl font-bold text-gray-900 text-center">
              {formatPrice(typical)}
            </div>
            <div className="flex justify-between text-2xl font-semibold text-gray-700 mx-8">
              <span>{formatPrice(low)}</span>
              <span className="text-gray-400">typical</span>
              <span>{formatPrice(high)}</span>
            </div>
            <div className="text-center text-sm text-gray-600">
              Low / Typical / High estimates (incl. VAT)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown */}
      {reasonBreakdown.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              What affected your price
            </h3>
            <div className="space-y-2">
              {reasonBreakdown.map((reason, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{reason}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assumptions */}
      {assumptions.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-bold text-lg mb-4">Assumptions</h3>
            <ul className="space-y-2 text-sm">
              {assumptions.map((assumption, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span>{assumption}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Exclusions & Disclaimers */}
      <div className="space-y-4">
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="pt-6">
            <h3 className="font-bold text-lg mb-3 text-orange-800">Exclusions</h3>
            <ul className="space-y-1 text-sm text-orange-800">
              {exclusions.map((exclusion, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <span>{exclusion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6 text-sm">
            <div className="space-y-2 text-gray-700">
              {[
                "⚠️ This is an automated estimate based on market averages, NOT a binding quote",
                "📏 Photos provide supporting signals only - no precise measurements made",
                "👷 Always get 2-3 onsite professional quotes before hiring",
                "🛠️ Prices valid for standard residential jobs in good condition"
              ].map((disclaimer, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">{disclaimer.split(' ')[0]}</span>
                  <span>{disclaimer.slice(disclaimer.indexOf(' ') + 1)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}