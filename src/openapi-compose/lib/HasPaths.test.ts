import HasPaths from '#sut/lib/HasPaths.js';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

await describe('HasPaths', async () => {
	await Promise.all(
		[
			{ expected: true, value: { paths: {} } },
			{ expected: false, value: { foo: 'bar' } },
			{ expected: false, value: null },
			{ expected: false, value: undefined },
			{ expected: false, value: 'foo' }
		].map(async ({ value, expected }) =>
			it(`should return ${expected} for ${JSON.stringify(value)}`, () => {
				assert.strictEqual(HasPaths(value), expected);
			})
		)
	);
});
