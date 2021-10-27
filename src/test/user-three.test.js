const request = require('supertest');
const buildApp = require('../app');
const UserRepo = require('../repos/user-repo');

const Context = require('./Context');

let context;
beforeAll(async () => {
	context = await Context.build();
});

// after complete test close connection that testing can naturally exit.
afterAll(() => {
	return context.close();
});

it('create a user', async () => {
	const startCount = await UserRepo.count();
	// expect(startCount).toEqual(0);

	await request(buildApp()).post('/users').send({ username: 'test user', bio: 'test bio' }).expect(200);

	const finishCount = await UserRepo.count();
	expect(finishCount - startCount).toEqual(1);
});
