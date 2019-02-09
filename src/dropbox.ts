/* global fetch */
/* eslint camelcase: ["error", {allow: [
    "include_deleted",
    "include_has_explicit_shared_members",
    "shared_folder_id"
]}] */
require('isomorphic-fetch');
const Promise = require('bluebird');
const Dropbox = require('dropbox').Dropbox;
const dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN, fetch });

const recursiveGetFilesAndFolders = (root = '', filesAndFolders = [], cursor = null) => {
  // have to add filesListFolderFunction to dbx because of internal `this` references
  dbx.filesListFolderFunction = dbx.filesListFolder;
  let filesListFolderArg: object | null = {
    path: root,
    recursive: true,
    include_deleted: false,
    include_has_explicit_shared_members: true
  };
  if (cursor) {
    dbx.filesListFolderFunction = dbx.filesListFolderContinue;
    filesListFolderArg = { cursor };
  }
  return dbx.filesListFolderFunction(filesListFolderArg)
    .then((response: any) => {
      if (response.entries.length < 1) {
        return { root, filesAndFolders };
      }
      return Promise.map(response.entries, (entry: any) => {
        // add sharingFolderMetadata to entry if folder is shared
        if (entry.shared_folder_id) {
          return dbx.sharingGetFolderMetadata({ shared_folder_id: entry.shared_folder_id })
            .then((sharingFolderMetadata: any) => Object.assign(entry, { sharingFolderMetadata }));
        }
        return entry;
      })
        .then((entries: any) => {
          const newFilesAndFolders = filesAndFolders.concat(entries);
          if (response.has_more) {
            return recursiveGetFilesAndFolders(root, newFilesAndFolders, response.cursor);
          }
          return { root, filesAndFolders: newFilesAndFolders };
        })
        ;
    })
    .catch((err: any) => {
      console.log('recursiveGetFilesAndFolders');
      console.error(err);
    })
    ;
};

const getComplexShares = (root: string = '', silent: boolean = false) => {
  return recursiveGetFilesAndFolders(root)
    .then(({ root, filesAndFolders }: { root: string, filesAndFolders: object[] }) => {
      const sharedPaths = filesAndFolders
        .filter((faf: any) => Boolean(faf.shared_folder_id) || Boolean(faf.has_explicit_shared_members))
        .map((share: any) => share.path_display);
      return sharedPaths;
    })
    .catch((err: any) => {
      console.error(err);
    })
    ;
}

const recursiveGetLinkShares = (linkShares = [], cursor = null) => {
  const sharingListSharedLinkArgs: any = {};
  if (cursor) {
    sharingListSharedLinkArgs.cursor = cursor;
  }
  return dbx.sharingListSharedLinks(sharingListSharedLinkArgs)
    .then((sharingListSharedLinksResult: any) => {
      const newLinkShares = linkShares.concat(sharingListSharedLinksResult.links);
      if (sharingListSharedLinksResult.has_more) {
        return recursiveGetLinkShares(newLinkShares, sharingListSharedLinksResult.cursor);
      }
      return { linkShares: newLinkShares };
    })
    ;
}

const getLinkShares = (filterString: string | null = null, silent: boolean = false) => {
  return recursiveGetLinkShares()
    .then(({ linkShares }: { linkShares: any }) => {
      const sharedLinks = linkShares.map((ls: any) => ls.path_lower);
      const filteredLinks = filterString ? sharedLinks.filter((path: string) => !path.includes(filterString)) : sharedLinks;
      return filteredLinks;
    })
    .catch((err: any) => {
      console.error(err);
    })
    ;
}

export {
  getLinkShares,
  getComplexShares
};
