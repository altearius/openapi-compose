#!/usr/bin/env node

import { Argument, Command } from 'commander';
import { YAMLException } from 'js-yaml';
import CompileRoot from './lib/CompileRoot.js';
import Log from './lib/Log.js';
import ResolvePaths from './lib/ResolvePaths.js';

const program = new Command('openapi-compose');
program.description('OpenAPI Composition');

const template = new Argument('<template>', 'A template OpenAPI file.');
program.addArgument(template);

program.option('-v, --verbose', 'Enable verbose logging.');

interface IOptions {
	readonly verbose: boolean;
}

program.action(async (rawTemplatePath: string, opts: IOptions) => {
	if (opts.verbose) {
		Log.verbose = true;
	}

	const paths = ResolvePaths(rawTemplatePath);

	try {
		await CompileRoot(paths.templatePath, paths.rootPath);
	} catch (ex: unknown) {
		if (ex instanceof YAMLException) {
			Log.error(ex);
			program.error('Failed to compose OpenAPI root document.', {
				exitCode: 1
			});
			return;
		}

		throw ex;
	}
});

await program.parseAsync();
