import type CompileRoot from '#sut/lib/CompileRoot.js';
import esmock from 'esmock';
import yaml from 'js-yaml';
import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';

await describe('CompileRoot', async () => {
	const mockProcessTemplate = mock.fn(async () => Promise.resolve({}));
	const mockWriteFile = mock.fn(async () => Promise.resolve());
	const mockYaml = mock.method(yaml, 'dump');
	const templatePath = '/path/to/template.yaml';
	const targetPath = './path/to/result.yaml';

	const sut = await esmock<typeof CompileRoot>('#sut/lib/CompileRoot.js', {
		'#sut/lib/ProcessTemplate.js': { default: mockProcessTemplate },
		'node:fs/promises': { writeFile: mockWriteFile }
	});

	beforeEach(() => {
		mockProcessTemplate.mock.resetCalls();
		mockWriteFile.mock.resetCalls();
		mockYaml.mock.resetCalls();
	});

	await it('compiles the template and writes to the file', async () => {
		// Act
		await sut(templatePath, targetPath);

		// Assert
		assert.strictEqual(mockProcessTemplate.mock.calls.length, 1);
		assert.strictEqual(mockWriteFile.mock.calls.length, 1);
		assert.strictEqual(mockYaml.mock.calls.length, 1);
	});

	await it('does not write if there is nothing to write', async () => {
		// Act
		mockProcessTemplate.mock.mockImplementationOnce(async () =>
			Promise.resolve()
		);

		await sut(templatePath, targetPath);

		// Assert
		assert.strictEqual(mockProcessTemplate.mock.calls.length, 1);
		assert.strictEqual(mockWriteFile.mock.calls.length, 0);
	});
});
