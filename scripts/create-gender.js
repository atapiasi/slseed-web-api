/**
 * Create User script.
 *
 * Creates a Cognito user and the user reference in the database.
 *
 * @example $ NODE_ENV=local node scripts/create-user.js
 */

const awsProfile = require('../utils/aws-profile');

awsProfile.update();

const validator = require('validator');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');

const ssmr = require('../utils/ssm-params-resolve');
const package = require('../package.json');

const spinner = ora();

console.log(`\n${chalk.cyan.bold('Create Gender Script')}\n`);
console.log(`${chalk.bold('Profile: ')} ${process.env.AWS_PROFILE}`);
console.log(`${chalk.bold('Group:   ')} ${package.group.title}\n`);

/* Fetch SSM parameters */
(async () => {
  try {
    spinner.text = 'Resolving SSM parameters...';

    spinner.start();

    await ssmr(['db-uri'], true);

    spinner.succeed('SSM parameters resolved.');

    spinner.text = 'Connecting to the database...';

    spinner.start();

    const Database = require('../service/components/database');

    const db = new Database();

    await db.connect();

    spinner.succeed('Successfully connected to the database.');

    const questions = [
      {
        name: 'tag',
        type: 'input',
        message: 'Gender Tag:',
        validate: val => val && !validator.isEmpty(val)
      }
    ];

    const answers = await inquirer.prompt(questions);

    spinner.text = 'Inserting Gender reference in the database...';

    spinner.start();

    const gender = await db.model('gender').create(answers);

    if (!gender) {
      throw new Error('Gender not created!');
    }

    spinner.succeed(`Gender reference created: ${chalk.bold(gender._id.toString())}`);

    process.exit(0);
  } catch (err) {
    spinner.fail(err.message);

    console.error(err);

    process.exit(1);
  }
})();
