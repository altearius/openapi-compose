import type CompileRoot from '#sut/lib/CompileRoot.js';
import type ProcessTemplate from '#sut/lib/ProcessTemplate.js';
import esmock from 'esmock';
import yaml from 'js-yaml';
import assert from 'node:assert/strict';
import type { Mock } from 'node:test';
import { beforeEach, describe, it, mock } from 'node:test';

await describe('CompileRoot', async () => {
	const mockProcessTemplate = mock.fn<typeof ProcessTemplate>();
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
		// Arrange
		mockProcessTemplate.mock.mockImplementationOnce(async () =>
			Promise.resolve({ paths: {} })
		);

		// Act
		await sut(templatePath, targetPath);

		// Assert

		// Justification: We are not calling this Function, so the signature
		// is not important.
		// eslint-disable-next-line @typescript-eslint/ban-types
		const calledOnce = (name: string, { mock: m }: Mock<Function>) =>
			assert.strictEqual(m.callCount(), 1, `${name} was not called`);

		calledOnce('ProcessTemplate', mockProcessTemplate);
		calledOnce('yaml.dump', mockYaml);
		calledOnce('writeFile', mockWriteFile);
	});

	await it('does not write if there is nothing to write', async () => {
		// Act
		mockProcessTemplate.mock.mockImplementationOnce(async () =>
			Promise.resolve(undefined)
		);

		await sut(templatePath, targetPath);

		// Assert
		assert.strictEqual(mockProcessTemplate.mock.callCount(), 1);
		assert.strictEqual(mockWriteFile.mock.callCount(), 0);
	});
});
