import { Command, flags } from '@oclif/command'
import { getLinkShares, getComplexShares } from './dropbox';
import { Promise } from 'bluebird';
//@ts-ignore
import * as ora from 'ora';
//@ts-ignore
import * as Table from 'tty-table';

class SharefinderCli extends Command {
  static description = 'Finds your Dropbox shared files and folders'

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
    links: flags.boolean({
      char: 'l',
      description: 'Search for link shares'
    }),
    filter: flags.string({
      char: 'f',
      description: 'Path to filter. Example: "/screenshots". Only applies with --links.',
      dependsOn: ['links']
    }),
    member: flags.boolean({
      char: 'm',
      description: 'Search for member shares'
    }),
    root: flags.string({
      char: 'r',
      description: 'Root directory to search from. Example "/documents". Only applies with --complex',
      dependsOn: ['member']
    }),
    silent: flags.boolean({ char: 's' })
  }

  async run() {
    const { args, flags } = this.parse(SharefinderCli)

    const getTable = (data: string[]) => {
      const header = [
        { value: 'path' },
        { value: 'url' }
      ];
      const rows = data.map(path => [path, `https://www.dropbox.com/home${encodeURIComponent(path)}`]);
      const footer = [`${data.length} shares found`, ''];
      const opts = { headerAlign: 'left', align: 'left', footerColor: 'blue' };
      const t = Table(header, rows, footer, opts);
      const s = t.render();
      return s;
    }

    console.log({ flags });
    if (Object.keys(flags).length < 1) {
      this.log('Run `sharefinder -h` for help');
      return;
    }
    const getters = [];
    let spinner: any;
    if (!flags.silent) {
      spinner = ora({
        text: 'Finding shares (this may take awhile)...',
        spinner: 'monkey'
      }).start();
    }
    if (flags.links) {
      getters.push(getLinkShares(flags.filter));
    }
    if (flags.member) {
      getters.push(getComplexShares(flags.root));
    }
    return Promise.all(getters)
      .then((results: string[][]) => {
        spinner && spinner.succeed();
        results.forEach((result) => {
          this.log(getTable(result));
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
