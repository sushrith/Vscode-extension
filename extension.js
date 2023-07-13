const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const Diff = require('diff');
const request = require('request');

function findLanguage(filePath){
	let extension = path.extname(filePath);
	console.log(extension);
	if(extension == '.py'){
		return "python";
	}else if(extension == '.js'){
		return "javascript";
	}
}

function activate(context) {
	let disposable = vscode.commands.registerCommand('autobots-m.generateCodeUsingAI', () => {
		//prompt
		vscode.window.showInputBox({ prompt: 'Enter your prompt',placeHolder: 'Which feature needs to be added?' }).then((prompt) => {
			if (!prompt) {
			  return;
			}
			console.log(prompt);

		// Open the file to replace its content
	  vscode.window.showOpenDialog({ canSelectMany: false }).then((fileUris) => {
		if (fileUris && fileUris.length === 1) {
		  const fileUri = fileUris[0];
		  const filePath = fileUri.fsPath;
			console.log(filePath);
			console.log(findLanguage(filePath));

		  // Read the file content
		  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
		  // Make an API call to fetch the data
		  request('http://127.0.0.1:5000/dummy-api', (error, response, apiData) => {
			if (error) {
			  vscode.window.showErrorMessage('An error occurred while making the API call.');
			  return;
			}
			console.log(response);
			const newContent = apiData;
  
			// Create a new TextEditor with the modified content
			vscode.workspace.openTextDocument({ content: newContent,language:findLanguage(filePath)}).then((document) => {
			  vscode.window.showTextDocument(document, vscode.ViewColumn.Beside, true).then(() => {
				const newFilePath = filePath.replace(/(\.[^/.]+)$/, '_improved$1');
  
				// Save the modified content to the new file
				fs.writeFile(newFilePath, newContent, 'utf-8', (err) => {
				  if (err) {
					vscode.window.showErrorMessage('An error occurred while saving the file with improved content.');
					return;
				  }
  
				  vscode.window.showInformationMessage(`New file created: ${newFilePath}`);
				});
			  });
			});
		  });
		} else {
		  vscode.window.showErrorMessage('Please select a file to replace its content.');
		}
	  });
	});
});
  
	context.subscriptions.push(disposable);
  }  
// This method is called when your extension is deactivated
function deactivate() {
	console.log('Extension deactivated');
}

module.exports = {
	activate,
	deactivate
}

