export default {
  // No need to set the `handler` as the function loader does it
  description: 'Dummy test function.',
  events: [
    {
      http: {
        method: 'get',
        path: '/test',
        cors: '${self:custom.cors}',
        authorizer: '${self:custom.authorizer}'
      }
    }
  ]
};
