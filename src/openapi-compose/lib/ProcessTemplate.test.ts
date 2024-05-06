import type FindFiles from '#sut/lib/FindFiles.js';
import type ProcessFiles from '#sut/lib/ProcessFiles.js';
import type ProcessTemplate from '#sut/lib/ProcessTemplate.js';
import type ReadTemplate from '#sut/lib/ReadTemplate.js';
import esmock from 'esmock';
import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';

await describe('ProcessTemplate', async () => {
	const mockReadTemplate = mock.fn<typeof ReadTemplate>();
	const mockFindFiles = mock.fn<typeof FindFiles>();
	const mockProcessFiles = mock.fn<typeof ProcessFiles>();

	beforeEach(() => {
		mockReadTemplate.mock.resetCalls();
		mockFindFiles.mock.resetCalls();
		mockProcessFiles.mock.resetCalls();
	});

	const sut = await esmock<typeof ProcessTemplate>(
		'#sut/lib/ProcessTemplate.js',
		{
			'#sut/lib/FindFiles.js': { default: mockFindFiles },
			'#sut/lib/ProcessFiles.js': { default: mockProcessFiles },
			'#sut/lib/ReadTemplate.js': { default: mockReadTemplate }
		}
	);

	await it('should not attempt to process an invalid template', async () => {
		// Arrange
		mockReadTemplate.mock.mockImplementationOnce(async () => Promise.resolve());

		// Act
		await sut('template.yaml', 'target.yaml');

		// Assert
		assert.strictEqual(mockReadTemplate.mock.callCount(), 1);
		assert.strictEqual(mockFindFiles.mock.callCount(), 0);
		assert.strictEqual(mockProcessFiles.mock.callCount(), 0);
	});

	await it('should expand the $imports section of a template', async () => {
		// Arrange
		mockReadTemplate.mock.mockImplementationOnce(async () =>
			Promise.resolve({
				info: { title: 'Test API', version: '0.1.0' },
				openapi: '3.1.0',
				paths: {
					$imports: ['**/openapi.yaml'],
					'/api/path': { $ref: 'path/to/definition.yaml' }
				}
			})
		);

		mockFindFiles.mock.mockImplementationOnce(async () => Promise.resolve([]));

		mockProcessFiles.mock.mockImplementationOnce(async function* () {
			await Promise.resolve();
			yield ['/imported/path', 'path/to/imported/definition.yaml'];
		});

		// Act
		const result = await sut('/path/to/template.yaml', '/path/to/target.yaml');

		// Assert
		assert.strictEqual(mockReadTemplate.mock.callCount(), 1);
		assert.strictEqual(mockFindFiles.mock.callCount(), 1);
		assert.strictEqual(mockProcessFiles.mock.callCount(), 1);

		assert.deepStrictEqual(result, {
			info: { title: 'Test API', version: '0.1.0' },
			openapi: '3.1.0',
			paths: {
				'/api/path': { $ref: 'path/to/definition.yaml' },
				'/imported/path': { $ref: 'path/to/imported/definition.yaml' }
			}
		});
	});
});
