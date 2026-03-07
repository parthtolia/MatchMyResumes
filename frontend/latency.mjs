import http from 'http';

const start = performance.now();
const req = http.get('http://127.0.0.1:8000/api/dashboard/stats', {
    headers: {
        'Authorization': 'Bearer dev-token'
    }
}, (res) => {
    const ttfb = performance.now();
    console.log(`TTFB: ${Math.round(ttfb - start)}ms`);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const end = performance.now();
        console.log(`Total Time: ${Math.round(end - start)}ms`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Data: ${data.substring(0, 50)}...`);
    });
});

req.on('socket', (socket) => {
    socket.on('lookup', () => {
        console.log(`DNS Lookup: ${Math.round(performance.now() - start)}ms`);
    });
    socket.on('connect', () => {
        console.log(`TCP Connect: ${Math.round(performance.now() - start)}ms`);
    });
});

req.on('error', (e) => {
    console.error(`Error: ${e.message}`);
});
