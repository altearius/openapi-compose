import { dirname } from 'node:path';
import FindFiles from './FindFiles.js';
import type ILog from './ILog.js';
import ProcessFiles from './ProcessFiles.js';
import ReadTemplate from './ReadTemplate.js';

export default async function ProcessTemplate(
	templatePath: string,
	targetPath: string,
	log: ILog
) {
	const template = await ReadTemplate(templatePath, log);
	if (!template) {
		return;
	}

	const { $imports, ...templatePathSection } = template.paths;
	const generatedPaths = new Map<string, { readonly $ref: string }>();
	const files = await FindFiles(template, templatePath, targetPath, log);
	const targetDir = dirname(targetPath);

	for await (const [path, refPath] of ProcessFiles(files, targetDir, log)) {
		generatedPaths.set(path, { $ref: refPath });
	}

	return {
		...template,
		paths: {
			...templatePathSection,
			...Object.fromEntries(
				[...generatedPaths.entries()].sort(([a], [b]) =>
					a < b ? -1 : a > b ? 1 : 0
				)
			)
		}
	};
}
