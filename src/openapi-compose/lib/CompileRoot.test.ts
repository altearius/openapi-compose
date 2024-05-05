import type CompileRoot from '#sut/lib/CompileRoot.js';
import esmock from 'esmock';
import yaml from 'js-yaml';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

await describe('CompileRoot', async () => {
	await it('compiles the template and writes to the file', async (ctx) => {
		// Arrange
		const mockProcessTemplate = ctx.mock.fn(async () => Promise.resolve({}));
		const mockWriteFile = ctx.mock.fn(async () => Promise.resolve());
		const mockYaml = ctx.mock.method(yaml, 'dump');

		const sut = await esmock<typeof CompileRoot>('#sut/lib/CompileRoot.js', {
			'#sut/lib/ProcessTemplate.js': { default: mockProcessTemplate },
			'node:fs/promises': { writeFile: mockWriteFile }
		});

		const templatePath = '/path/to/template';
		const targetPath = './xyzzy.yaml';

		// Act
		await sut(templatePath, targetPath);

		// Assert
		assert.strictEqual(mockProcessTemplate.mock.calls.length, 1);
		assert.strictEqual(mockWriteFile.mock.calls.length, 1);
		assert.strictEqual(mockYaml.mock.calls.length, 1);
	});
});
