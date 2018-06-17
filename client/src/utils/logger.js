
import debug from 'debug';

function logger(conf)
{
    const log = debug(`${conf}:log`);
    const error = debug(`${conf}:error`);
    const warn = debug(`${conf}:warn`);

    error.log = console.warn.bind(console);
    warn.log = console.warn.bind(console);

    return [log, error, warn];
}

export default logger;
