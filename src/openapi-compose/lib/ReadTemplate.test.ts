import type HasPaths from '#sut/lib/HasPaths.js';
import type HumanPath from '#sut/lib/HumanPath.js';
import type ReadTemplate from '#sut/lib/ReadTemplate.js';
import TestLog from '#test/TestLog.js';
import esmock from 'esmock';
import yaml from 'js-yaml';
import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';
import type IHasPaths from './IHasPaths.js';

await describe('ReadTemplate', async () => {
	const mockHasPaths = mock.fn<typeof HasPaths>();
	const mockHumanPath = mock.fn<typeof HumanPath>();
	const mockLogWarn = mock.method(TestLog, 'warn');
	const mockReadFile = mock.fn<() => Promise<string>>();
	const mockYamlLoad = mock.method(yaml, 'load');

	beforeEach(() => {
		mockHasPaths.mock.resetCalls();
		mockHumanPath.mock.resetCalls();
		mockLogWarn.mock.resetCalls();
		mockReadFile.mock.resetCalls();
		mockYamlLoad.mock.resetCalls();
	});

	const sut = await esmock<typeof ReadTemplate>('#sut/lib/ReadTemplate.js', {
		'#sut/lib/HasPaths.js': { default: mockHasPaths },
		'#sut/lib/HumanPath.js': { default: mockHumanPath },
		'node:fs/promises': { readFile: mockReadFile }
	});

	await it('should read and load the template file', async () => {
		// Arrange
		const template = { paths: { '/users': {} } };
		mockYamlLoad.mock.mockImplementationOnce(() => template);
		mockReadFile.mock.mockImplementationOnce(async () => Promise.resolve(''));

		mockHasPaths.mock.mockImplementationOnce(
			(x: unknown): x is IHasPaths => true
		);

		// Act
		const result = await sut('/path/to/template.yaml', TestLog);

		// Assert
		assert.strictEqual(mockReadFile.mock.callCount(), 1);
		assert.strictEqual(mockYamlLoad.mock.callCount(), 1);
		assert.strictEqual(mockHasPaths.mock.callCount(), 1);
		assert.strictEqual(mockLogWarn.mock.callCount(), 0);
		assert.deepStrictEqual(result, template);
	});

	await it('emits a warning if there are no paths', async () => {
		// Arrange
		const template = { paths: { '/users': {} } };
		mockReadFile.mock.mockImplementationOnce(async () => Promise.resolve(''));
		mockYamlLoad.mock.mockImplementationOnce(() => template);
		mockLogWarn.mock.mockImplementationOnce(() => {});

		mockHasPaths.mock.mockImplementationOnce(
			(x: unknown): x is IHasPaths => false
		);

		// Act
		const result = await sut('/path/to/template.yaml', TestLog);

		// Assert
		assert.strictEqual(mockReadFile.mock.callCount(), 1);
		assert.strictEqual(mockYamlLoad.mock.callCount(), 1);
		assert.strictEqual(mockHasPaths.mock.callCount(), 1);
		assert.strictEqual(mockLogWarn.mock.callCount(), 1);
		assert.strictEqual(result, undefined);
	});
});
