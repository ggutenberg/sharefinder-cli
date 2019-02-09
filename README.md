sharefinder-cli
===============

Finds your Dropbox shared files and folders.

# Usage

Create a `DROPBOX_ACCESS_TOKEN` environment variable and set its value to your Dropbox access token. See https://blogs.dropbox.com/developers/2014/05/generate-an-access-token-for-your-own-account/ for details.

Note that running this can take awhile. In testing, scanning through 640 GB took about 10 minutes.

## Help

```
sharefinder -h
```

## Find link shares

Find all link shares

```
sharefinder -l
```

Filter shares containing "/screenshots" in their path

```
sharefinder -l -f "/screenshots"
```

## Find member shares

Find all member shares (files and folders shared with explicit Dropbox members)

```
sharefinder -m
```

Find all member shares using "/documents" as the root

```
sharefinder -m -r "/documents"
```

## Find link and member shares

```
sharefinder -l -m
```
