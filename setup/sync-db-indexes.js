/**
 * Database index sync script.
 *
 * @example $ NODE_ENV=local node scripts/db-indexes.js
 */

const { prompt } = require('inquirer');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const chalk = require('chalk');
const path = require('path');
const ora = require('ora');

(async () => {
  console.log(`\n${chalk.cyan.bold('Database Indexes Script')}\n`);

  await require('../utils/stage-select')(); // Set proper stage ENV

  dotenv.config({
    path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`)
  });

  const schemas = require('../service/components/schemas');
  const spinner = ora('');

  mongoose.set('debug', true);

  try {
    const questions = [
      {
        name: 'confirm',
        type: 'confirm',
        message: 'Proceed with index syncing?'
      }
    ];

    const answers = await prompt(questions);

    if (!answers.confirm) {
      console.log(chalk.bold.yellow('\nCanceled\n'));
      process.exit();
    }

    spinner.start('Connecting to the database...');

    const { uri, options } = require('../service/configs/database');

    await mongoose.connect(
      uri,
      options
    );

    spinner.succeed('Connected to the database.');

    spinner.info(
      `${chalk.bold('Target:')} ${process.env.DB_URI.replace(/^mongodb(\+srv)?:\/\/([^:]+:[^@]+@)?(.+)/, '$3')}`
    );

    spinner.start('Registering schemas...');

    schemas.register(mongoose);

    spinner.succeed('Schemas registered.');

    spinner.start('Syncing indexes...');

    for (let name of Object.keys(mongoose.models)) {
      await mongoose.model(name).syncIndexes();
    }

    spinner.succeed('Indexes synced!');

    await mongoose.disconnect();

    spinner.info('Database connection closed.');
  } catch (err) {
    spinner.fail(err.message);

    console.error(err);

    process.exit(1);
  }
})();
