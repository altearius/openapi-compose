import yaml from 'js-yaml';
import { writeFile } from 'node:fs/promises';
import ProcessTemplate from './ProcessTemplate.js';

export default async function CompileRoot(
	templatePath: string,
	targetPath: string
) {
	const schema = await ProcessTemplate(templatePath, targetPath);
	if (!schema) {
		return;
	}

	const fileOutput = yaml.dump(schema);

	await writeFile(targetPath, fileOutput, 'utf8');
}
