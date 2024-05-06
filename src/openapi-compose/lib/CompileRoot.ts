import yaml from 'js-yaml';
import { writeFile } from 'node:fs/promises';
import type ILog from './ILog.js';
import ProcessTemplate from './ProcessTemplate.js';

export default async function CompileRoot(
	templatePath: string,
	targetPath: string,
	log: ILog = console
) {
	const schema = await ProcessTemplate(templatePath, targetPath, log);
	if (!schema) {
		return;
	}

	const fileOutput = yaml.dump(schema);

	await writeFile(targetPath, fileOutput, 'utf8');
}
