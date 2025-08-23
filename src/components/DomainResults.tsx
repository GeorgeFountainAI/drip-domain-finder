// src/components/DomainResults.tsx

import React from 'react';
import { buildSpaceshipUrl } from '@/utils/spaceship';
import { useSelectedDomains } from '../lib/store';

type DomainResult = {
  domain: string;
  available: boolean;
  price: number;
  flipScore?: number;
};

interface Props {
  results: DomainResult[];
}

const DomainResults: React.FC<Props> = ({ results }) => {
  const {
    selectedDomains,
    add: selectDomain,
    remove: deselectDomain,
    clear: clearSelected,
  } = useSelectedDomains();

  const toggleSelection = (domain: string) => {
    if (selectedDomains.includes(domain)) {
      deselectDomain(domain);
    } else {
      selectDomain(domain);
    }
  };

  const openAffiliateLinks = () => {
    const selected = results.filter((d) =>
      selectedDomains.includes(d.domain)
    );
    selected.forEach((d) => {
      window.open(buildSpaceshipUrl(d.domain), '_blank', 'noopener,noreferrer');
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Results</h2>
      {results.length === 0 && (
        <p className="text-gray-500">No results found.</p>
      )}
      <ul className="space-y-2">
        {results.map((d) => (
          <li
            key={d.domain}
            className={`flex items-center justify-between p-3 border rounded-lg ${
              d.available
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 bg-gray-100'
            }`}
          >
            <div>
              <div className="font-medium">{d.domain}</div>
              <div className="text-sm text-gray-600">
                {d.available ? 'Available' : 'Unavailable'} — ${d.price.toFixed(2)}
              </div>
            </div>
            {d.available && (
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedDomains.includes(d.domain)}
                  onChange={() => toggleSelection(d.domain)}
                  className="w-5 h-5"
                />
                <a
                  href={buildSpaceshipUrl(d.domain)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Buy
                </a>
              </div>
            )}
          </li>
        ))}
      </ul>

      {selectedDomains.length > 0 && (
        <div className="mt-6 flex items-center space-x-4">
          <button
            onClick={openAffiliateLinks}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Buy Selected ({selectedDomains.length})
          </button>
          <button
            onClick={clearSelected}
            className="bg-gray-300 px-3 py-2 rounded-md hover:bg-gray-400"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

export default DomainResults;
