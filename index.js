const express = require('express');

const client = require('prom-client');
const Registry = client.Registry;
const register = new Registry();
const histogram = new client.Histogram({
    name: 'performance',
    help: 'performance monitoring',
    registers: [register],
    buckets: [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7],
});
// register.registerMetric(histogram);

const app = express();

app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (ex) {
        res.status(500).end(ex);
    }
});

let count = 0;
app.get('/do', (_, res) => {
    if (count > 30) {
        count = 0;
    }
    const end = histogram.startTimer();
    setTimeout(() => {
        console.log('request: ', end());
        res.send('OK');
    }, ++count * 0.1 * 1000)
});

app.listen(3000, () => {
    console.log(`server started at port ${3000}`);
});
