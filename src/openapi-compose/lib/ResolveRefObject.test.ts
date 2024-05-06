import type HumanPath from '#sut/lib/HumanPath.js';
import type ResolveRefObject from '#sut/lib/ResolveRefObject.js';
import TestLog from '#test/TestLog.js';
import esmock from 'esmock';
import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';

await describe('ResolveRefObject', async () => {
	const mockHumanPath = mock.fn<typeof HumanPath>();
	const mockWarn = mock.method(TestLog, 'warn');

	beforeEach(() => {
		mockHumanPath.mock.resetCalls();
		mockWarn.mock.resetCalls();
	});

	const sut = await esmock<typeof ResolveRefObject>(
		'#sut/lib/ResolveRefObject.js',
		{
			'#sut/lib/HumanPath.js': { default: mockHumanPath }
		}
	);

	await it('emits a warning for an invalid ref', () => {
		// Arrange
		mockWarn.mock.mockImplementationOnce(() => {});

		// Act
		sut('/path/to/file', '/api/path', '/target/dir', { $ref: 42 }, TestLog);

		// Assert
		assert.strictEqual(mockHumanPath.mock.callCount(), 1);
	});

	await it('resolves a ref as relative to the target dir', () => {
		// Act
		const result = sut(
			'/path/to/template/context/file1.yaml',
			'/api/path',
			'/path/to/template',
			{ $ref: '../another/file2.yaml' },
			TestLog
		);

		// Assert
		assert.strictEqual(result, './another/file2.yaml#/paths/~1api~1path');
	});

	await it('can handle a ref to a file-relative position', () => {
		// Act
		const result = sut(
			'/path/to/template/context/file1.yaml',
			'/api/path',
			'/path/to/template',
			{ $ref: '#/any/where/is/fine' },
			TestLog
		);

		// Assert
		assert.strictEqual(result, './context/file1.yaml#/any/where/is/fine');
	});

	await it('can handle a ref that contains a hash', () => {
		// Act
		const result = sut(
			'/path/to/template/context/file1.yaml',
			'/api/path',
			'/path/to/template',
			{ $ref: '../another/file2.yaml#/any/where/is/fine' },
			TestLog
		);

		// Assert
		assert.strictEqual(result, './another/file2.yaml#/any/where/is/fine');
	});

	await it('refuses to let a $ref with a hash exit scope', () => {
		// Arrange
		mockWarn.mock.mockImplementationOnce(() => {});

		// Act
		const result = sut(
			'/path/to/template/context/file1.yaml',
			'/api/path',
			'/path/to/template',
			{ $ref: '../../../../another/file2.yaml#/any/where/is/fine' },
			TestLog
		);

		// Assert
		assert.strictEqual(result, undefined);
		assert.strictEqual(mockWarn.mock.callCount(), 1);
	});

	await it('refuses to let a $ref without a hash exit scope', () => {
		// Arrange
		mockWarn.mock.mockImplementationOnce(() => {});

		// Act
		const result = sut(
			'/path/to/template/context/file1.yaml',
			'/api/path',
			'/path/to/template',
			{ $ref: '../../../../another/file2.yaml' },
			TestLog
		);

		// Assert
		assert.strictEqual(result, undefined);
		assert.strictEqual(mockWarn.mock.callCount(), 1);
	});
});
