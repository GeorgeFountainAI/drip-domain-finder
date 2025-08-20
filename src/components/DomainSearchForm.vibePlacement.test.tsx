import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, test, expect } from "vitest";
import { DomainSearchForm } from "./DomainSearchForm";

describe("DomainSearchForm VibeFilter placement", () => {
  test("VibeFilter renders directly under the search section", () => {
    const { getByTestId } = render(<DomainSearchForm />);
    const searchSection = getByTestId("search-section");
    const vibeFilter = getByTestId("vibe-filter");
    expect(searchSection).toBeInTheDocument();
    expect(vibeFilter).toBeInTheDocument();
    const orderOk =
      searchSection.compareDocumentPosition(vibeFilter) & Node.DOCUMENT_POSITION_FOLLOWING;
    expect(orderOk).toBeTruthy();
  });
});