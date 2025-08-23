import React from "react";
import { useSearchStore, useSelectedDomains } from "@/lib/store";

const DomainResults = () => {
  const { results } = useSearchStore();
  const { selectedDomains, add, remove } = useSelectedDomains();

  const handleCheckboxChange = (domain: string) => {
    if (selectedDomains.includes(domain)) {
      remove(domain);
    } else {
      add(domain);
    }
  };

  const buildBuyLink = (domain: string) => {
    return `https://www.spaceship.com/domains/domain-registration/results?search=${domain}&irclickid=Wc7xihyLMxycUY8QQ-Spo2Tf4Ukp26X0lyT-3Uk0`;
  };

  return (
    <div className="flex flex-col gap-4">
      {results.map((item) => {
        const isSelected = selectedDomains.includes(item.domain);
        const scoreOutOfTen = item.flipScore
          ? Math.round((item.flipScore / 100) * 10)
          : 0;

        return (
          <div
            key={item.domain}
            className="rounded-xl border border-purple-300 p-4 shadow-md"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleCheckboxChange(item.domain)}
                />
                <span className="text-lg font-bold text-purple-800">{item.domain}</span>
              </div>
              <div className="text-sm text-purple-600 bg-purple-100 rounded px-2 py-1">
                Flip Score: {scoreOutOfTen}/10
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-600 text-sm mb-2">
              <span>✅ Available</span>
              <span className="text-black">${item.price?.toFixed(2)}/year</span>
            </div>
            <a
              href={buildBuyLink(item.domain)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 inline-flex items-center gap-1"
            >
              BUY NOW{" "}
              <span role="img" aria-label="arrow">
                🔗
              </span>
            </a>
          </div>
        );
      })}
    </div>
  );
};

export default DomainResults;
