import { App, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";
import { getAPI } from "obsidian-dataview";
import { DataArray } from "obsidian-dataview/lib/api/data-array";
import { Literal } from "obsidian-dataview/lib/data-model/value";
type DataviewPages = DataArray<Record<string, Literal> & { file: any }>;
import { Utils } from "./utils";
// Remember to rename these classes and interfaces!

interface ExportPublicNotesPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: ExportPublicNotesPluginSettings = {
	mySetting: "default",
};

export default class ExportPublicNotesPlugin extends Plugin {
	settings: ExportPublicNotesPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"folder",
			"Export public files",
			(evt: MouseEvent) => {
				const dataview = getAPI(this.app);
				const query = `"knowledge" or "week-notes" or "recipes"`;
				const notes = dataview?.pages(query) as DataviewPages;

				const publicNotes = notes.filter(
					(p) => p.visibility === "public"
				);
				const privateNotes = notes.filter(
					(p) => p.visibility === "private"
				);
				const unlistedNotes = notes.filter(
					(p) => p.visibility === "unlisted"
				);
				const missedNotes = notes.filter((p) => !p?.visibility);

				// console.log(publicNotes);
				// console.log(privateNotes);
				// console.log(unlistedNotes);
				// console.log(missedNotes);

				const { notePaths: missedNotePaths } =
					this.outputFilePaths(missedNotes);

				const {
					notePaths: publicNotePaths,
					noteAttachmentPaths: publicNoteAttachmentPaths,
					pathsToCheck: publicPathsToCheck,
				} = this.outputFilePaths(publicNotes);
				const {
					notePaths: unlistedNotePaths,
					noteAttachmentPaths: unlistedNoteAttachmentPaths,
					pathsToCheck: unlistedPathsToCheck,
				} = this.outputFilePaths(unlistedNotes);

				const outputNotePaths = [].concat(
					publicNotePaths,
					unlistedNotePaths
				);
				const outputNoteAttachmentPaths = [].concat(
					publicNoteAttachmentPaths,
					unlistedNoteAttachmentPaths
				);
				const outputPathsToCheck = [].concat(
					publicPathsToCheck,
					unlistedPathsToCheck
				);

				console.info("Missed notes");
				console.info(missedNotePaths);

				console.info("Output paths to check");
				console.log(outputPathsToCheck);

				const outputPaths = [].concat(
					outputNotePaths,
					outputNoteAttachmentPaths
				);

				Utils.writeAndOpenFile(
					this.app,
					"utils/publish/to-publish--notes.txt",
					outputNotePaths.join("\n"),
					false
				);
				Utils.writeAndOpenFile(
					this.app,
					"utils/publish/to-publish--attachments.txt",
					outputNoteAttachmentPaths.join("\n"),
					false
				);
				Utils.writeAndOpenFile(
					this.app,
					"utils/publish/to-publish.txt",
					outputPaths.join("\n"),
					false
				);
				Utils.writeAndOpenFile(
					this.app,
					"utils/publish/attachments-to-check.txt",
					outputPathsToCheck.join("\n"),
					false
				);
				Utils.writeAndOpenFile(
					this.app,
					"utils/publish/missed-notes.txt",
					missedNotePaths.join("\n"),
					false
				);

				// Called when the user clicks the icon.
				new Notice("Exported files!");
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("export-public-notes-ribbon-class");

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Status Bar Text");

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	outputFilePaths(notes) {
		const notePaths = [];
		const noteAttachmentPaths = [];
		const pathsToCheck = [];
		notes.map((n) => {
			notePaths.push(n.file.path);
			n.file?.outlinks?.values.map((o) => {
				// https://stackoverflow.com/questions/680929/how-to-extract-extension-from-filename-string-in-javascript
				const re = /(?:\.([^.]+))?$/;
				const fileExtension = re.exec(o.path)[1];
				if (fileExtension && fileExtension !== "md") {
					noteAttachmentPaths.push(o.path);
					if (
						!["jpg", "jpeg", "JPG", "png", "gif"].includes(
							fileExtension
						)
					) {
						pathsToCheck.push(o.path);
					}
				}
			});
		});

		return {
			notePaths,
			noteAttachmentPaths,
			pathsToCheck,
		};
	}

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

class SampleSettingTab extends PluginSettingTab {
	plugin: ExportPublicNotesPlugin;

	constructor(app: App, plugin: ExportPublicNotesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Settings for my awesome plugin." });

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						console.log("Secret: " + value);
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
