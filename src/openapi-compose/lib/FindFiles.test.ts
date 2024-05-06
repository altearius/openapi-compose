import TestLog from '#test/TestLog.js';
import { strict as esmock } from 'esmock';
import type fg from 'fast-glob';
import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';
import type FindFiles from './FindFiles.js';
import type ReadWildcards from './ReadWildcards.js';

await describe('FindFiles', async () => {
	const templatePath = '/path/to/template.yaml';
	const targetPath = './path/to/result.yaml';

	const mockReadWildcards = mock.fn<typeof ReadWildcards>();
	const mockWarn = mock.method(TestLog, 'warn');
	const mockDebug = mock.method(TestLog, 'debug');
	const mockFg = mock.fn<typeof fg>();

	beforeEach(() => {
		mockReadWildcards.mock.resetCalls();
		mockWarn.mock.resetCalls();
		mockDebug.mock.resetCalls();
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
		const result = await sut(template, templatePath, targetPath, TestLog);

		// Assert
		assert.strictEqual(mockReadWildcards.mock.callCount(), 1);
		assert.strictEqual(mockWarn.mock.callCount(), 1);
		assert.strictEqual(mockFg.mock.callCount(), 0);
		assert.strictEqual(result.length, 0);
	});

	await it('processes any wildcards that it finds', async () => {
		// Arrange
		const wildcards = 'wildcards';
		const template = { paths: { $imports: [wildcards] } };
		mockReadWildcards.mock.mockImplementationOnce(() => [wildcards]);
		mockFg.mock.mockImplementationOnce(() => ['result']);
		mockDebug.mock.mockImplementationOnce(() => {});

		// Act
		const result = await sut(template, templatePath, targetPath, TestLog);

		// Assert
		assert.strictEqual(mockReadWildcards.mock.callCount(), 1);
		assert.strictEqual(mockWarn.mock.callCount(), 0);
		assert.strictEqual(mockFg.mock.callCount(), 1);
		assert.deepStrictEqual(mockFg.mock.calls[0]?.arguments?.[0], [wildcards]);
		assert.deepStrictEqual(result, ['result']);
	});
});
