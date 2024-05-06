import type HasPaths from '#sut/lib/HasPaths.js';
import type HumanPath from '#sut/lib/HumanPath.js';
import Log from '#sut/lib/Log.js';
import type ProcessFiles from '#sut/lib/ProcessFiles.js';
import type ProcessPaths from '#sut/lib/ProcessPaths.js';
import { strict as esmock } from 'esmock';
import yaml from 'js-yaml';
import assert from 'node:assert/strict';
import type { readFile } from 'node:fs/promises';
import { beforeEach, describe, it, mock } from 'node:test';

await describe('ProcessFiles', async () => {
	const mockDebug = mock.method(Log, 'debug');
	const mockHasPaths = mock.fn<typeof HasPaths>();
	const mockHumanPath = mock.fn<typeof HumanPath>();
	const mockProcessPaths = mock.fn<typeof ProcessPaths>();
	const mockReadFile = mock.fn<typeof readFile>();
	const mockWarn = mock.method(Log, 'warn');
	const mockYamlLoad = mock.method(yaml, 'load');

	beforeEach(() => {
		mockDebug.mock.resetCalls();
		mockHasPaths.mock.resetCalls();
		mockHumanPath.mock.resetCalls();
		mockProcessPaths.mock.resetCalls();
		mockReadFile.mock.resetCalls();
		mockWarn.mock.resetCalls();
		mockYamlLoad.mock.resetCalls();
	});

	const sut = await esmock<typeof ProcessFiles>('#sut/lib/ProcessFiles.js', {
		'#sut/lib/HasPaths.js': { default: mockHasPaths },
		'#sut/lib/HumanPath.js': { default: mockHumanPath },
		'#sut/lib/ProcessPaths.js': { default: mockProcessPaths },
		'node:fs/promises': { readFile: mockReadFile }
	});

	await it('should process files and yield API paths', async () => {
		// Arrange
		mockDebug.mock.mockImplementation(() => {});
		mockWarn.mock.mockImplementation(() => {});
		mockReadFile.mock.mockImplementation(async () => Promise.resolve(''));
		mockHasPaths.mock.mockImplementation(() => true);

		mockYamlLoad.mock.mockImplementation(() => ({
			paths: { '/api/path': '/ref/path' }
		}));

		mockProcessPaths.mock.mockImplementation(function* () {
			yield ['/api/path', '/ref/path'];
		});

		const files = ['/path/to/file1.yaml', '/path/to/file2.yaml'];
		const targetDir = '/path/to/target';

		// Act
		const result = [];
		for await (const [apiPath, refPath] of sut(files, targetDir)) {
			result.push([apiPath, refPath]);
		}

		// Assert
		assert.deepStrictEqual(result, [['/api/path', '/ref/path']]);

		// Justification: Meaning is obvious.
		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
		assert.strictEqual(mockDebug.mock.calls.length, 2);

		assert.deepStrictEqual(
			mockReadFile.mock.calls.map((x) => x.arguments),
			[
				['/path/to/file1.yaml', 'utf8'],
				['/path/to/file2.yaml', 'utf8']
			]
		);
	});

	await it('emits a warning for a spec with no paths', async () => {
		// Arrange
		mockDebug.mock.mockImplementation(() => {});
		mockWarn.mock.mockImplementation(() => {});
		mockReadFile.mock.mockImplementation(async () => Promise.resolve(''));
		mockHasPaths.mock.mockImplementation(() => false);

		// Act
		const result = [];
		for await (const [apiPath, refPath] of sut([''], '')) {
			result.push([apiPath, refPath]);
		}

		// Assert
		assert.strictEqual(result.length, 0);
		assert.strictEqual(mockWarn.mock.calls.length, 1);
	});
});
