const { Ok } = require('../../components/responses');

const Request = require('../../components/request');

/**
 * Test handler function.
 *
 * @returns {Object|Error} The response.
 */
module.exports.handler = async event => {
  const req = new Request(event);

  try {
    await req.db.connect();

    return new Ok(auth);
  } catch (error) {
    return req.send(error);
  }
};
