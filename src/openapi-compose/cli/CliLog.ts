import { YAMLException } from 'js-yaml';
import { styleText } from 'node:util';
import HumanPath from '../lib/HumanPath.js';

function error(yamlException: YAMLException): void;
function error(...messages: unknown[]): void;
function error(...messages: unknown[]) {
	if (messages.length === 1) {
		const [ex] = messages;
		if (ex instanceof YAMLException) {
			const msg1 = `${ex.reason} in ${HumanPath(ex.mark.name)}`;
			const msg2 = `(${ex.mark.line + 1}, ${ex.mark.column + 1}):\n`;
			const msg = msg1 + msg2 + ex.mark.snippet;
			error(msg);
			return;
		}
	}

	console.error(styleText('redBright', '✖'), ...messages);
}

const CliLog = {
	debug: (...messages: unknown[]) => {
		if (CliLog.verbose) {
			console.debug(styleText('gray', '⚙'), ...messages);
		}
	},
	error,
	info: (...messages: unknown[]) => {
		console.info(styleText('blueBright', 'ℹ'), ...messages);
	},
	verbose: false,
	warn: (...messages: unknown[]) => {
		console.warn(styleText('yellowBright', '⚠'), ...messages);
	}
};

export default CliLog;
