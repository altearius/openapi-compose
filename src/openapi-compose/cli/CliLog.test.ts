import type CliLog from '#sut/cli/CliLog.js';
import type HumanPath from '#sut/lib/HumanPath.js';
import { strict as esmock } from 'esmock';
import { YAMLException } from 'js-yaml';
import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';

await describe('CliLog', async () => {
	const mockHumanPath = mock.fn<typeof HumanPath>();
	const mockError = mock.method(console, 'error');
	const mockDebug = mock.method(console, 'debug');
	const mockWarn = mock.method(console, 'warn');
	const mockInfo = mock.method(console, 'info');

	beforeEach(() => {
		mockHumanPath.mock.resetCalls();
		mockError.mock.resetCalls();
		mockDebug.mock.resetCalls();
		mockWarn.mock.resetCalls();
		mockInfo.mock.resetCalls();
	});

	const sut = await esmock<typeof CliLog>('#sut/cli/CliLog.js', {
		'#sut/lib/HumanPath.js': { default: mockHumanPath }
	});

	await it('should humanize a YAMLException', () => {
		// Arrange
		mockError.mock.mockImplementationOnce(() => {});

		const yamlException = new YAMLException('Invalid YAML', {
			buffer: '',
			column: 10,
			line: 5,
			name: '/path/to/file.yaml',
			position: 0,
			snippet: 'Some YAML snippet'
		});

		// Act
		sut.error(yamlException);

		// Assert
		assert.strictEqual(mockHumanPath.mock.callCount(), 1);
		assert.strictEqual(mockError.mock.callCount(), 1);
		assert.strictEqual(mockDebug.mock.callCount(), 0);
		assert.strictEqual(mockWarn.mock.callCount(), 0);
		assert.strictEqual(mockInfo.mock.callCount(), 0);
	});

	await it('emits debug messages when verbose is enabled', () => {
		// Arrange
		sut.verbose = true;
		mockDebug.mock.mockImplementationOnce(() => {});

		// Act
		sut.debug('Debug message');

		// Assert
		assert.strictEqual(mockHumanPath.mock.callCount(), 0);
		assert.strictEqual(mockError.mock.callCount(), 0);
		assert.strictEqual(mockDebug.mock.callCount(), 1);
		assert.strictEqual(mockWarn.mock.callCount(), 0);
		assert.strictEqual(mockInfo.mock.callCount(), 0);
	});

	await it('suppresses debug messages when verbose is disabled', () => {
		// Arrange
		sut.verbose = false;

		// Act
		sut.debug('Debug message');

		// Assert
		assert.strictEqual(mockHumanPath.mock.callCount(), 0);
		assert.strictEqual(mockError.mock.callCount(), 0);
		assert.strictEqual(mockDebug.mock.callCount(), 0);
		assert.strictEqual(mockWarn.mock.callCount(), 0);
		assert.strictEqual(mockInfo.mock.callCount(), 0);
	});

	await it('sends info messages to console.info', () => {
		// Arrange
		mockInfo.mock.mockImplementationOnce(() => {});

		// Act
		sut.info('Info message');

		// Assert
		assert.strictEqual(mockHumanPath.mock.callCount(), 0);
		assert.strictEqual(mockError.mock.callCount(), 0);
		assert.strictEqual(mockDebug.mock.callCount(), 0);
		assert.strictEqual(mockWarn.mock.callCount(), 0);
		assert.strictEqual(mockInfo.mock.callCount(), 1);
	});

	await it('sends warning messages to console.warn', () => {
		// Arrange
		mockWarn.mock.mockImplementationOnce(() => {});

		// Act
		sut.warn('Warning message');

		// Assert
		assert.strictEqual(mockHumanPath.mock.callCount(), 0);
		assert.strictEqual(mockError.mock.callCount(), 0);
		assert.strictEqual(mockDebug.mock.callCount(), 0);
		assert.strictEqual(mockWarn.mock.callCount(), 1);
		assert.strictEqual(mockInfo.mock.callCount(), 0);
	});
});
