import React from "react";
import TrustBadge from "./TrustBadge";
import { useSearchStore } from "@/lib/store";

const DomainResults: React.FC = () => {
  const { results, loading } = useSearchStore();

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <TrustBadge visible={results.length > 0 && !loading} />
          {results.length === 0 && !loading ? (
            <p>No results found</p>
          ) : (
            <ul>
              {results.map((r) => (
                <li key={r.domain}>
                  {r.domain} - ${r.price} {r.available ? "✅" : "❌"}
                  {r.flipScore && <span> Flip Score: {r.flipScore}</span>}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default DomainResults;
