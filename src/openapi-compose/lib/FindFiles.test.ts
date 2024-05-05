import Log from '#sut/lib/Log.js';
import esmock from 'esmock';
import type fg from 'fast-glob';
import assert from 'node:assert';
import { beforeEach, describe, it, mock } from 'node:test';
import type FindFiles from './FindFiles.js';
import type ReadWildcards from './ReadWildcards.js';

await describe('FindFiles', async () => {
	const templatePath = '/path/to/template.yaml';
	const targetPath = './path/to/result.yaml';

	const mockReadWildcards = mock.fn<typeof ReadWildcards>();
	const mockWarn = mock.method(Log, 'warn');
	const mockFg = mock.fn<typeof fg>();

	beforeEach(() => {
		mockReadWildcards.mock.resetCalls();
		mockWarn.mock.resetCalls();
		mockFg.mock.resetCalls();
	});

	const sut = await esmock<typeof FindFiles>('#sut/lib/FindFiles.js', {
		'#sut/lib/ReadWildcards.js': { default: mockReadWildcards },
		'fast-glob': { default: mockFg }
	});

	await it('should return an empty array if for 0 wildcards', async () => {
		// Arrange
		const template = { paths: { '/some/path': {} } };
		mockReadWildcards.mock.mockImplementationOnce(() => []);
		mockWarn.mock.mockImplementationOnce(() => {});

		// Act
		const result = await sut(template, templatePath, targetPath);

		// Assert
		assert.strictEqual(mockReadWildcards.mock.calls.length, 1);
		assert.strictEqual(mockWarn.mock.calls.length, 1);
		assert.strictEqual(mockFg.mock.calls.length, 0);
		assert.strictEqual(result.length, 0);
	});
});
