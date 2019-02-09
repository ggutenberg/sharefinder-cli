sharefinder-cli
===============

Finds your Dropbox shared files and folders.

# Usage

Create a `DROPBOX_ACCESS_TOKEN` environment variable and set its value to your Dropbox access token.

Note that this can take awhile.  In testing, scanning through 640 GB took about 10 minutes.

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

## Find complex (file and folder) shares

Find all complex shares

```
sharefinder -c
```

Find all complex shares using "/documents" as the root

```
sharefinder -c -r "/documents"
```

## Find link and complex shares

```
sharefinder -l -c
```
