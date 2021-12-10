/*
import netcat from 'netcat'
const server = new netcat.server()
const client = new netcat.client()

server.port(2389).listen().exec('/bin/bash')
process.stdin.pipe(client.addr('127.0.0.1').port(2389).connect().pipe(process.stdout).stream())
*/
import netcat from 'netcat'
const client = new netcat.client()
process.stdin.pipe( client.addr('127.0.0.1').port(1456).connect().pipe(process.stdout).stream())
