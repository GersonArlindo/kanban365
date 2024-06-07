/* eslint-disable no-console */
import app from "./app";
import db from '../src/db/connection.db';

/**
 * Start Express server.
 */
const server = app.listen(app.get("port"), () => {
	console.log(
		"  App is running at http://localhost:%d in %s mode",
		app.get("port"),
		app.get("env"),
	);
	console.log("  Press CTRL-C to stop\n");

	try {
		db.authenticate();
		console.log('Connection has been established successfully.');
	} catch (error) {
		console.error('Unable to connect to the database:', error);
	}
});

export default server;
