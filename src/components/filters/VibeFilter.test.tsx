import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { describe, test, expect } from "vitest";
import VibeFilter from "./VibeFilter";

describe("VibeFilter", () => {
  test("renders Vibe label, tooltip, chips, and toggles state", async () => {
    const user = userEvent.setup();
    const { getByText, getByRole } = render(<VibeFilter />);
    const heading = getByText("Vibe");
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveAttribute("title");
    const chip = getByRole("button", { name: "Urban" });
    expect(chip).toHaveAttribute("aria-pressed", "false");
    await user.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "true");
  });
});