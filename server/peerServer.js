import { PeerServer } from 'peer';
import chalk from 'chalk';

// Create a PeerJS server
const peerServer = PeerServer({
  port: 3001,
  path: '/peerjs',
  proxied: true,
  debug: true,
  allow_discovery: true
});

// Log when the server starts
peerServer.on('connection', (client) => {
  console.log(chalk.green(`PeerJS client connected: ${client.id}`));
});

peerServer.on('disconnect', (client) => {
  console.log(chalk.yellow(`PeerJS client disconnected: ${client.id}`));
});

console.log(chalk.blue('PeerJS server running on port 3001'));

export default peerServer;
