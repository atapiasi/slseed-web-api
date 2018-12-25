const package = require('../../package.json');

const Parameters = require('./parameters');
const Resources = require('./resources');
const Outputs = require('./outputs');

module.exports = {
  Description: `${package.description} Stack [${process.env.NODE_ENV}]`,
  AWSTemplateFormatVersion: '2010-09-09',
  Parameters,
  Resources,
  Outputs
};
