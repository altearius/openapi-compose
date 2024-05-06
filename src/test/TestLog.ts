import type ILog from '../openapi-compose/lib/ILog.js';

const silent = () => {
	// silence log messages for tests.
};

const TestLog: ILog = {
	debug: silent,
	error: silent,
	info: silent,
	warn: silent
};

export default TestLog;
