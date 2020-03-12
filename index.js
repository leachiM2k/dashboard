'use strict';

const compress = require('compression');
const express = require('express');
const path = require('path');
const util = require('util');

const port = process.env.PORT || 3000;

const app = express();

app.disable('x-powered-by');
app.get(['/health', '/health/readiness'], (req, res) => res.send('ok'));

app.set('env', process.env.NODE_ENV || 'default');
app.set('port', port);

const staticFilePath = path.join(__dirname, './public');

app.use(express.static(staticFilePath));
app.use(compress());

app.listen(port, err => {
    if (err) {
        throw err
    }
    console.log('Server will listen on port: ' + port);
});

app.get('/data/timetable', async (req, res) => {
    const request = require('request');
    const querystring = require('querystring');
    const _get = util.promisify(request.get);
    const params = {
        language: 'de',
        itdLPxx_dmRefresh: '',
        typeInfo_dm: 'stopID',
        nameInfo_dm: 20018230,
        useRealtime: 1,
        limit: 10,
        mode: 'direct',
        outputFormat: 'JSON',
    };
    const data = await _get('https://efa.vrr.de/standard/XSLT_DM_REQUEST?' + querystring.stringify(params));
    res.send(data.body);
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(staticFilePath, 'index.html'));
});

app.use((err, req, res, next) => {
    if (err.status) {
        res.status(err.status);
    }
    if (err.errors) {
        res.json(err.errors);
    }
    res.send(err);
});
