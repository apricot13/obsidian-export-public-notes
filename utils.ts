import { App, TFile } from "obsidian";

export class Utils {
	/**
	 * Writes the text to the file and opens the file in a new pane if it is not opened yet
	 * @param app
	 * @param outputFileName name of the output file
	 * @param text data to be written to the file
	 */
	static async writeAndOpenFile(
		app: App,
		outputFileName: string,
		text: string,
		openFile: boolean
	) {
		await app.vault.adapter.write(outputFileName, text);
		if (!openFile) return;

		let fileIsAlreadyOpened = false;
		app.workspace.iterateAllLeaves((leaf) => {
			if (
				leaf.getDisplayText() != "" &&
				outputFileName.startsWith(leaf.getDisplayText())
			) {
				fileIsAlreadyOpened = true;
			}
		});
		if (!fileIsAlreadyOpened) {
			const newPane = app.workspace.getLeavesOfType("empty").length == 0;
			if (newPane) {
				app.workspace.openLinkText(outputFileName, "/", true);
			} else {
				const file = app.vault.getAbstractFileByPath(outputFileName);

				if (file instanceof TFile) {
					await app.workspace
						.getLeavesOfType("empty")[0]
						.openFile(file);
				} else {
					app.workspace.openLinkText(outputFileName, "/", true);
				}
			}
		}
	}
}
