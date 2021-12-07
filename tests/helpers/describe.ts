import { suite } from "uvu";
import type { Test } from "uvu";

export const describe = (name: string, fn: (it: Test) => void): void => {
	const describe = suite(name);
	fn(describe);
	describe.run();
};
