const { randomBytes } = require('crypto');
const { default: migrate } = require('node-pg-migrate');
const format = require('pg-format');
const pool = require('../pool');

const DEFAULT_OPTS = {
	host: 'localhost',
	post: 5432,
	database: 'socialnetwork-test',
	user: 'postgres',
	password: '12580963'
};

class Context {
	constructor(roleName) {
		this.roleName = roleName;
	}

	static async build() {
		// Random generating a role name to connect to PG as
		const roleName = 'a' + randomBytes(4).toString('hex'); // in PG role name cannot start number.

		await pool.connect(DEFAULT_OPTS);

		// create a new role.
		await pool.query(format('CREATE ROLE %I WITH LOGIN PASSWORD %L', roleName, roleName));
		// `CREATE ROLE ${roleName} WITH LOGIN PASSWORD '${roleName}';`

		// Create a schema with same name
		await pool.query(format('CREATE SCHEMA %I AUTHORIZATION %I', roleName, roleName));
		// `CREATE SCHEMA ${roleName} AUTHORIZATION ${roleName}`

		// Disconnect entirely from PG
		await pool.close();

		// Run our migrations in the new schema
		await migrate({
			schema: roleName,
			direction: 'up',
			log: () => {},
			noLock: true,
			dir: 'migrations',
			databaseUrl: {
				host: 'localhost',
				port: 5432,
				database: 'socialnetwork-test',
				user: roleName,
				password: roleName
			}
		});

		// Connect to PG as the newly created role
		await pool.connect({
			host: 'localhost',
			port: 5432,
			database: 'socialnetwork-test',
			user: roleName,
			password: roleName
		});

		return new Context(roleName);
	}

	async close() {
		// Disconnect from PG
		await pool.close();

		// Reconnect as our root user
		await pool.connect(DEFAULT_OPTS);

		// Delete the role and schema we created
		await pool.query(format('DROP SCHEMA %I CASCADE;', this.roleName));
		await pool.query(format('DROP ROLE %I;', this.roleName));

		// Disconnect
		await pool.close();
	}

	async reset() {
		return await pool.query('DELETE FROM users;');
	}
}

module.exports = Context;
