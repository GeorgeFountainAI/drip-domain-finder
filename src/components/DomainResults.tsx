import React from "react";
import FlipScoreBadge from "./FlipScoreBadge";
import { TrustBadge } from "./TrustBadge";

type DomainResult = {
  domain: string;
  available: boolean;
  price: number;
  flipScore: number;
};

type DomainResultsProps = {
  query: string;
  fetcher: (query: string) => Promise<{
    results: DomainResult[];
    suggestions: any[];
  }>;
};

const DomainResults: React.FC<DomainResultsProps> = ({ query, fetcher }) => {
  const [results, setResults] = React.useState<DomainResult[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetcher(query)
      .then((data) => {
        setResults(data.results);
      })
      .finally(() => setLoading(false));
  }, [query, fetcher]);

  if (!query) return null;

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <TrustBadge visible={results.length > 0} />
          <ul>
            {results.map((r) => (
              <li key={r.domain}>
                {r.domain} - ${r.price} {r.available ? "✅" : "❌"}{" "}
                <FlipScoreBadge score={r.flipScore} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default DomainResults;
