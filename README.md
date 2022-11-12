# Obsidian export public notes plugin

This is a WIP plugin, so WIP in fact it doesn't even build outside of dev!

Currently it exports a list of paths to txt files for further processing.

-   `utils/publish/to-publish--notes.txt` - the notes to be published
-   `to-publish--attachments.txt` - the files that go along with the notes to be published
-   `utils/publish/to-publish.txt` - the above two notes combined
-   `utils/publish/attachments-to-check.txt` - if attachments arent a specific format (`"jpg", "jpeg", "JPG", "png", "gif"`) then flag these files for extra review
-   `utils/publish/missed-notes.txt` - notes that don't have `visibility` set at all

It also logs any notes that have been missed to the console along with any paths to check.

## How to use

-   Clone this repo.
-   `npm i` or `yarn` to install dependencies
-   `npm run dev` to start compilation in watch mode.

## API Documentation

See https://github.com/obsidianmd/obsidian-api
