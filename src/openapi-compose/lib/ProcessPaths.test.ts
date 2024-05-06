import type HumanPath from '#sut/lib/HumanPath.js';
import type ProcessPaths from '#sut/lib/ProcessPaths.js';
import type ResolveRefObject from '#sut/lib/ResolveRefObject.js';
import TestLog from '#test/TestLog.js';
import esmock from 'esmock';
import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';

await describe('ProcessPaths', async () => {
	const mockHumanPath = mock.fn<typeof HumanPath>();
	const mockWarn = mock.method(TestLog, 'warn');
	const mockResolveRefObject = mock.fn<typeof ResolveRefObject>();

	beforeEach(() => {
		mockHumanPath.mock.resetCalls();
		mockWarn.mock.resetCalls();
		mockResolveRefObject.mock.resetCalls();
	});

	const sut = await esmock<typeof ProcessPaths>('#sut/lib/ProcessPaths.js', {
		'#sut/lib/HumanPath.js': { default: mockHumanPath },
		'#sut/lib/ResolveRefObject.js': { default: mockResolveRefObject }
	});

	await it('aborts for an invalid path object', async () => {
		// Arrange
		mockWarn.mock.mockImplementation(() => {});
		const file = '/path/to/file.yaml';
		const paths = { '/api/path': 'not an object' };
		const targetDir = '/path/to/target';

		// Act
		const result = [];
		for await (const [apiPath, refPath] of sut(
			file,
			paths,
			targetDir,
			TestLog
		)) {
			result.push([apiPath, refPath]);
		}

		// Assert
		assert.deepEqual(result, []);
		assert.strictEqual(mockWarn.mock.callCount(), 1);
	});

	await it('aborts for a null path object', async () => {
		// Arrange
		mockWarn.mock.mockImplementation(() => {});
		const file = '/path/to/file.yaml';
		const paths = { '/api/path': null };
		const targetDir = '/path/to/target';

		// Act
		const result = [];
		for await (const [apiPath, refPath] of sut(
			file,
			paths,
			targetDir,
			TestLog
		)) {
			result.push([apiPath, refPath]);
		}

		// Assert
		assert.deepEqual(result, []);
		assert.strictEqual(mockWarn.mock.callCount(), 1);
	});

	await it('resolves $ref values in a path', async () => {
		// Arrange
		mockResolveRefObject.mock.mockImplementation(() => 'resolved ref');
		const file = '/path/to/file.yaml';
		const paths = { '/api/path': { $ref: 'some ref' } };
		const targetDir = '/path/to/target';

		// Act
		const result = [];
		for await (const [apiPath, refPath] of sut(
			file,
			paths,
			targetDir,
			TestLog
		)) {
			result.push([apiPath, refPath]);
		}

		// Assert
		assert.deepEqual(result, [['/api/path', 'resolved ref']]);
	});

	await it('refuses to resolve paths that are out of scope', async () => {
		// Arrange
		mockWarn.mock.mockImplementation(() => {});
		const file = '/path/to/file.yaml';
		const paths = { '/api/path': { put: {} } };
		const targetDir = '/path/to/target';

		// Act
		const result = [];
		for await (const [apiPath, refPath] of sut(
			file,
			paths,
			targetDir,
			TestLog
		)) {
			result.push([apiPath, refPath]);
		}

		// Assert
		assert.deepEqual(result, []);
		assert.strictEqual(mockWarn.mock.callCount(), 1);
	});

	await it('resolves a $ref value to paths that are not $refs', async () => {
		// Arrange
		const file = '/path/to/target/nested/file.yaml';
		const paths = { '/api/path': { put: {} } };
		const targetDir = '/path/to/target';

		// Act
		const result = [];
		for await (const [apiPath, refPath] of sut(
			file,
			paths,
			targetDir,
			TestLog
		)) {
			result.push([apiPath, refPath]);
		}

		// Assert
		assert.deepEqual(result, [
			['/api/path', './nested/file.yaml#/paths/~1api~1path']
		]);
	});
});
