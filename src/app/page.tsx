'use client';

import { useState } from 'react';

export default function Home() {
  const [civicNumber, setCivicNumber] = useState('');
  const [streetName, setStreetName] = useState('');
  const [unitSize, setUnitSize] = useState('4.5');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/evaluate?civicNumber=${civicNumber}&streetName=${streetName}&unitSize=${unitSize}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch data');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-6 pt-20">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">FillTheBlank</h1>
        <p className="text-gray-600">Calculates true TAL rent deltas and calls out blank Section G bluffs.</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Civic Number</label>
              <input type="text" className="w-full border border-gray-300 rounded-md p-2" value={civicNumber} onChange={(e) => setCivicNumber(e.target.value)} required />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Name</label>
              <input type="text" className="w-full border border-gray-300 rounded-md p-2" value={streetName} onChange={(e) => setStreetName(e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Size</label>
            <select className="w-full border border-gray-300 rounded-md p-2 bg-white" value={unitSize} onChange={(e) => setUnitSize(e.target.value)}>
              <option value="1.5">1 ½</option>
              <option value="2.5">2 ½</option>
              <option value="3.5">3 ½</option>
              <option value="4.5">4 ½</option>
              <option value="5.5">5 ½+</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-black text-white rounded-md py-3 font-medium mt-4 hover:bg-gray-800 disabled:opacity-50">
            {loading ? 'Calculating...' : 'Evaluate Market Rate'}
          </button>
        </form>

        {error && <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-100">{error}</div>}

        {result && (
          <div className="mt-8 border-t pt-6 space-y-4">
            <h3 className="text-xl font-bold">Evaluation Results</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Municipal Assessment</p>
                <p className="text-2xl font-bold">${result.property.assessmentValue?.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Regional Average ({result.marketMetrics.totalLocalComps} comps)</p>
                <p className="text-2xl font-bold">${result.marketMetrics.regionalAverageRent}/mo</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
