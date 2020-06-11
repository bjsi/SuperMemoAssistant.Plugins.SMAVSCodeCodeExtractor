import * as vscode from 'vscode';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { Extract } from './Model/Extract';

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "SMACodeExtractor" is active');

	const disposable = vscode.commands.registerCommand('extension.extract', async () => {
		const selected = GetSelected();
		if (!selected) return;
		const project = GetProject();
		const filepath = GetFilePath();
		const language = GetLanguage();

		// Validate
		const comment = await GetComment();
		if (typeof comment == 'undefined') {
			console.log('User cancelled extract');
			return;
		}

		const priority = await GetPriority();
		if (typeof priority == 'undefined') {
			console.log('User cancelled extract');
			return;
		} else if (priority < 0 || priority > 100) {
			vscode.window.showErrorMessage('Extraction requires valid priority value (0-100)');
			return;
		}

		const extract = new Extract();
		extract.comment = comment;
		extract.exported = false;
		extract.file = filepath;
		extract.language = language;
		extract.priority = priority;
		extract.project = project;
		extract.selectedCode = selected;
		extract.timestamp = Date.now();

		await CreateExtract(extract);
	});

	context.subscriptions.push(disposable);
}

async function CreateExtract(extract: Extract) {
	createConnection({
		type: 'sqlite',
		database: 'SMACodeExtracts.db',
		synchronize: true,
		logging: false,
		entities: [Extract],
	})
		.then(async (connection) => {
			await connection.manager.save(extract);
			const msg = 'Saved new Extract to database';
			console.log(msg);
			vscode.window.showInformationMessage(msg);
			await connection.close();
		})
		.catch((error) => {
			console.log(error);
			vscode.window.showErrorMessage(error);
		});
}

function GetSelected(): string {
	const editor = vscode.window.activeTextEditor;
	const document = editor?.document;
	if (!editor || !document) return '';
	const selected = editor?.selection;
	const text = document.getText(selected) ?? '';
	console.log(`Selected text is ${selected}`);
	return text;
}

function GetProject(): string {
	const project = vscode.workspace.name ?? '';
	console.log(`The current project is ${project}`);
	return project;
}

function GetFilePath(): string {
	const editor = vscode.window.activeTextEditor;
	const document = editor?.document;
	const fp = document?.fileName ?? '';
	console.log(`The current filepath is ${fp}`);
	return fp;
}

function GetLanguage(): string {
	const editor = vscode.window.activeTextEditor;
	const document = editor?.document;
	const language = document?.languageId ?? '';
	console.log(`The current language is ${language}`);
	return language;
}

async function GetComment(): Promise<string | undefined> {
	const comment = await vscode.window.showInputBox({
		prompt: 'Optional Comment:',
		value: '',
	});
	console.log(`The comment is ${comment}`);
	return comment;
}

async function GetPriority(): Promise<number | undefined> {
	const input = await vscode.window.showInputBox({
		value: '30',
		prompt: 'Extract Priority (%):',
	});
	if (!input) return undefined;
	const priority = parseFloat(input);
	if (Number.isNaN(priority)) return -1;
	console.log(`The priority is ${priority}`);
	return priority;
}
