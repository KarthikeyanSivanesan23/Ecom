import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Package, Palette, Ruler, AlertTriangle, Box, Layers } from 'lucide-react';

interface ColourBreakdown {
  [key: string]: number;
}

interface SizeBreakdown {
  [key: string]: number;
}

interface ArtworkRow {
  code: string;
  total: number;
  black: number;
  white: number;
  red: number;
}

interface ProductionData {
  totalProduction: number;
  totalAvailable: number;
  totalSold: number;
  totalReserved: number;
  totalSKUs: number;
  totalArtworks: number;
  totalDTFPlacements: number;
  colourBreakdown: ColourBreakdown;
  sizeBreakdown: SizeBreakdown;
  artworkBreakdown: ArtworkRow[];
  lowStock: number;
  outOfStock: number;
}

export default function NodaProduction() {
  const [data, setData] = useState<ProductionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/admin/noda/production');
        setData(res.data.data);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  if (!data) return null;

  const totalUnits = Object.values(data.colourBreakdown).reduce((a, b) => a + b, 0);

  const stats = [
    { label: 'Total Production', value: data.totalProduction, icon: Package, color: 'bg-blue-500' },
    { label: 'Total Available', value: data.totalAvailable, icon: Box, color: 'bg-green-500' },
    { label: 'Total Sold', value: data.totalSold, icon: Package, color: 'bg-purple-500' },
    { label: 'Total Reserved', value: data.totalReserved, icon: Layers, color: 'bg-yellow-500' },
    { label: 'Low Stock', value: data.lowStock, icon: AlertTriangle, color: 'bg-orange-500' },
    { label: 'Out of Stock', value: data.outOfStock, icon: AlertTriangle, color: 'bg-red-500' },
    { label: 'Total SKUs', value: data.totalSKUs, icon: Box, color: 'bg-indigo-500' },
    { label: 'Total Artworks', value: data.totalArtworks, icon: Palette, color: 'bg-pink-500' },
    { label: 'DTF Placements', value: data.totalDTFPlacements, icon: Layers, color: 'bg-teal-500' },
  ];

  const colourMeta: Record<string, { bg: string; bar: string }> = {
    Black: { bg: 'bg-gray-800', bar: 'bg-gray-800' },
    White: { bg: 'bg-gray-100', bar: 'bg-gray-300' },
    Red: { bg: 'bg-red-500', bar: 'bg-red-500' },
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">NODA Production Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="card p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Colour & Size Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Colour Breakdown */}
        <div className="card">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">Colour Breakdown</h2>
          </div>
          <div className="p-4 space-y-4">
            {Object.entries(data.colourBreakdown).map(([colour, count]) => {
              const meta = colourMeta[colour] || { bg: 'bg-gray-500', bar: 'bg-gray-500' };
              const pct = totalUnits > 0 ? Math.round((count / totalUnits) * 100) : 0;
              return (
                <div key={colour}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${meta.bg}`} />
                      <span className="text-sm font-medium text-gray-700">{colour}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {count} <span className="text-gray-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`${meta.bar} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Size Breakdown */}
        <div className="card">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">Size Breakdown</h2>
          </div>
          <div className="p-4 space-y-4">
            {Object.entries(data.sizeBreakdown).map(([size, count]) => {
              const pct = totalUnits > 0 ? Math.round((count / totalUnits) * 100) : 0;
              return (
                <div key={size}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">{size}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {count} <span className="text-gray-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Artwork Table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-900">Artwork Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Artwork</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Total</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Black</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">White</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Red</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.artworkBreakdown.map((row) => (
                <tr key={row.code} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.code}</td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-900">{row.total}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-gray-800" />
                      {row.black}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-gray-300" />
                      {row.white}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      {row.red}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
