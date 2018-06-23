
import debug from 'debug';

function logger(conf)
{
    const log = debug(`${conf}:log`);
    const error = debug(`${conf}:error`);
    const warn = debug(`${conf}:warn`);
    const fatal = debug(`${conf}:fatal`);

    error.log = console.warn.bind(console);
    warn.log = console.warn.bind(console);
    fatal.log = console.error.bind(console);

    return [log, error, warn, fatal];
}

export default logger;
