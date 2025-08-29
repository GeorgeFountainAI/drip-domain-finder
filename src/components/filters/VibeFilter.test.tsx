import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { describe, test, expect } from "vitest";
import VibeFilter from "./VibeFilter";

describe("VibeFilter", () => {
  test("renders VibeFilter with select dropdown", async () => {
    const user = userEvent.setup();
    const { getByText, getByRole } = render(<VibeFilter />);
    const heading = getByText("Choose Style & Vibe (optional)");
    expect(heading).toBeInTheDocument();
    const select = getByRole("combobox");
    expect(select).toBeInTheDocument();
    await user.click(select);
    const urbanOption = getByText("Urban");
    expect(urbanOption).toBeInTheDocument();
  });
});