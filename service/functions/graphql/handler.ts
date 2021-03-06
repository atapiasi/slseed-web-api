import { GraphQLServerLambda } from 'graphql-yoga';
import { createLogger } from '@fiquu/logger';
import {
  APIGatewayProxyEvent as Event,
  APIGatewayEventRequestContext as Context,
  APIGatewayProxyResult as Result
} from 'aws-lambda';

import { resolvers, typeDefs } from '../../components/graphql';

const log = createLogger('graphql-handler');

/**
 * GraphQL handler function.
 *
 * @param {object} event Call event object.
 * @param {object} context Context object.
 *
 * @returns {Promise} A promise to the response.
 */
export function handler(event: Event, context: Context): Promise<Result> {
  try {
    const { graphqlHandler } = new GraphQLServerLambda({
      context: (): Event => ({ ...event }),
      resolvers: { ...resolvers },
      typeDefs: String(typeDefs),
      options: {
        debug: ['local'].includes(process.env.NODE_ENV)
      }
    });

    return new Promise(resolve => {
      graphqlHandler(event, context, (err: Error, result: Result): void => {
        if (err) {
          log.error(err);
        }

        resolve(result);
      });
    });
  } catch (err) {
    log.error(err);

    return Promise.resolve({
      statusCode: 500,
      body: ''
    });
  }
}
