import { Command, flags } from '@oclif/command'
import { getLinkShares, getComplexShares } from './dropbox';
//@ts-ignore
import * as Table from 'tty-table';
import * as Listr from 'listr';

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

    const getTable = (data: string[], shareType: string) => {
      const header = [
        { value: 'path' },
        { value: 'url' }
      ];
      const rows = data.map(path => [path, `https://www.dropbox.com/home${encodeURIComponent(path)}`]);
      const footer = [`${data.length} ${shareType} shares found`, ''];
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
    if (flags.links) {
      getters.push({
        title: 'Finding link shares',
        task: (ctx: any) => getLinkShares(flags.filter).then((linkShares: string[]) => ctx.linkShares = linkShares)
      });
    }
    if (flags.member) {
      getters.push({
        title: 'Finding member shares',
        task: (ctx: any) => getComplexShares(flags.root).then((memberShares: string[]) => ctx.memberShares = memberShares)
      });
    }
    const tasks = new Listr(getters, { concurrent: true, exitOnError: false });
    return tasks.run({})
      .then((ctx: any) => {
        if (ctx.linkShares) {
          this.log(getTable(ctx.linkShares, 'link'));
        }
        if (ctx.memberShares) {
          this.log(getTable(ctx.memberShares, 'member'));
        }
      })
      .catch((err) => {
        this.error(err);
      })
      ;
  }
}

export = SharefinderCli
