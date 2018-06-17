
function pathToJSON(path, finalObj = {})
{
    let chunks = path;
    if (typeof path === 'string') chunks = path.split('/');

    const res = {};
    let rel = res;
    for (let i = 0; i < chunks.length; i++)
    {
        if (i === chunks.length - 1)
            rel[chunks[i]] = finalObj;
        else
            rel[chunks[i]] = {};

        rel = rel[chunks[i]];
    }
    return res;
}

window.pathToJSON = pathToJSON;

export default pathToJSON;
