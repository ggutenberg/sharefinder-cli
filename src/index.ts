import { Command, flags } from '@oclif/command'
import Help from '@oclif/plugin-help';
import { getLinkShares, getComplexShares } from './dropbox';
import { Promise } from 'bluebird';
//@ts-ignore
import * as ora from 'ora';

class SharefinderCli extends Command {
  static description = 'Finds your Dropbox shared files and folders'

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
    links: flags.boolean({ char: 'l' }),
    filter: flags.string({
      char: 'f',
      description: 'Path to filter. Example: "/screenshots". Only applies with --links.',
      dependsOn: ['links']
    }),
    complex: flags.boolean({ char: 'c' }),
    root: flags.string({
      char: 'r',
      description: 'Root directory to search from. Example "/documents". Only applies with --complex',
      dependsOn: ['complex']
    }),
    silent: flags.boolean({ char: 's' })
  }

  async run() {
    const { args, flags } = this.parse(SharefinderCli)

    const stringArrayToMultilineString = (arr: string[]) => {
      return arr.reduce((assembledString: string, sharedLinkPath: string) => (`${assembledString}\n${sharedLinkPath}`), '');
    }

    console.log(flags);
    if (Object.keys(flags).length < 1) {
      this.log('Run `sharefinder -h` for help');
      return;
    }
    const getters = [];
    let spinner: any = null;
    if (!flags.silent) {
      spinner = ora({
        text: 'Finding shares (this may take awhile)...',
        spinner: 'monkey'
      }).start();
    }
    if (flags.links) {
      getters.push(getLinkShares(flags.filter));
    }
    if (flags.complex) {
      getters.push(getComplexShares(flags.root));
    }
    return Promise.all(getters)
      .then((results: string[][]) => {
        spinner && spinner.succeed();
        results.forEach((result) => {
          this.log(stringArrayToMultilineString(result));
          this.log(result.length.toString());
        });
      })
      .catch((err) => {
        spinner && spinner.fail();
        this.error(err);
      })
      ;
  }
}

export = SharefinderCli
