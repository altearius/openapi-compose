import ReadWildcards from '#sut/lib/ReadWildcards.js';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

await describe('ReadWildcards', async () => {
	await it('should return an empty array if there are no wildcards', () => {
		// Arrange
		const o = {
			paths: {}
		};

		// Act
		const result = ReadWildcards(o);

		// Assert
		assert.deepStrictEqual(result, []);
	});

	await it('handles a single-valued import', () => {
		// Arrange
		const o = { paths: { $imports: '/path/to/file.yaml' } };

		// Act
		const result = ReadWildcards(o);

		// Assert
		assert.deepStrictEqual(result, ['/path/to/file.yaml']);
	});

	await it('handles an array of imports', () => {
		// Arrange
		const o = {
			paths: { $imports: ['/path/to/file.yaml', '/path/to/another.yaml'] }
		};

		// Act
		const result = ReadWildcards(o);

		// Assert
		assert.deepStrictEqual(result, [
			'/path/to/file.yaml',
			'/path/to/another.yaml'
		]);
	});
});
