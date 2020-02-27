/**
 * Request Component module.
 *
 * @module components/request
 */

const { Response, InternalServerError } = require('./responses');
const Database = require('./database');

const config = require('../configs/request');
const auth = require('../components/auth');

/**
 * Request handler class.
 *
 * @class Request
 */
class Request {
  /**
   * Creates an instance of Request.
   *
   * @param {Object} event Request event object.
   *
   * @memberof Request
   */
  constructor(event) {
    if (!(event instanceof Object)) {
      throw new Error('Event must be an object!');
    }

    this.db = new Database();

    this.event = event;
  }

  /**
   * Retrieves a header value or the whole headers object from the event object.
   *
   * @param {String} name The header name or empty for the full object.
   *
   * @returns {Mixed} The header value or the headers object.
   *
   * @memberof Request
   */
  getHeader(name) {
    try {
      const headers = {};

      for (let key of Object.keys(this.event.headers)) {
        headers[key.toLowerCase()] = this.event.headers[key];
      }

      if (!name) {
        return headers;
      }

      return headers[String(name).toLowerCase()];
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  /**
   * Retrieves a query parameter or the whole query object from the event
   *  object.
   *
   * @param {String} prop The query parameter name or empty for the full object.
   *
   * @returns {Mixed} The query parameter value or the query object.
   *
   * @memberof Request
   */
  getQuery(prop) {
    try {
      if (!prop) {
        return this.event.queryStringParameters;
      }

      return this.event.queryStringParameters[prop];
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  /**
   * Retrieves a route parameter from the request event object.
   *
   * @param {String} prop The request parameter name.
   *
   * @returns {Mixed} The route parameter value.
   *
   * @memberof Request
   */
  getParam(prop) {
    try {
      if (!prop) {
        return this.event.pathParameters;
      }

      return this.event.pathParameters[prop];
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  /**
   * Parses the request body if any.
   *
   * @returns {Mixed} The parsed JSON request body.
   *
   * @memberof Request
   */
  getBody() {
    try {
      return JSON.parse(this.event.body);
    } catch (err) {
      console.log(this.event.body);
      console.error(err);

      return null;
    }
  }

  /**
   * Retrieves the authorization data object.
   *
   * @return {Object} The User's data object.
   */
  async getAuthData() {
    try {
      const cfg = auth.getConfig();

      const { sub } = this.event.requestContext.authorizer.claims;

      const query = this.db.model(cfg.model).aggregate();

      query.match({
        sub
      });

      if (cfg.pipeline) {
        query.append(cfg.pipeline);
      }

      const [result] = await query;

      if (!result || !result._id) {
        throw new Error('No auth data found.');
      }

      return result;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  /**
   * Sends a response to the request.
   *
   * @param {Error|Response|Object} res The response object to send.
   *
   * @memberof Request
   */
  send(res) {
    /* Process empty responses as Internal Server Error (500) */
    if (!res) {
      console.error('Response is undefined!');
      return new InternalServerError();
    }

    /* Send response if it's an instance of Response */
    if (res instanceof Response) {
      return res;
    }

    console.warn('Handling response error:');
    console.warn(res);

    /* Handle known object names */
    if (config.handlers && res.name && config.handlers[res.name]) {
      return new config.handlers[res.name]();
    }

    /* Handle known object codes */
    if (config.handlers && res.code && config.handlers[res.code]) {
      return new config.handlers[res.code]();
    }

    /* Process generic Error response objects as Internal Server Error (500) */
    if (res instanceof Error) {
      return new InternalServerError();
    }

    /* Process unknown response objects as Internal Server Error (500) */
    return new InternalServerError(res.body, res.headers);
  }
}

module.exports = Request;
