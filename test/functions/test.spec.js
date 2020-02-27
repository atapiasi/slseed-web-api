const { getWrapper } = require('serverless-mocha-plugin');

const { expect } = require('chai');

const Database = require('../../service/components/database');

const db = new Database();

describe('Test Function', function () {
  this.timeout(30000);

  let wrapped;

  before(() => {
    wrapped = getWrapper('test', '/service/functions/test/handler', 'handler');
  });

  it('should respond 204 (NoContent)', async () => {
    const res = await wrapped.run({});

    expect(res).to.not.be.empty;
    expect(res.statusCode).to.equal(204);
    expect(res.body).to.be.empty;
  });


  after(async () => {
    await db.disconnect();
  });
});
