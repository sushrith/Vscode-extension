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
		  const content = fs.readFileSync(filePath, 'utf-8');
  
		  const requestBody = { prompt, content };

		  // Make an API call to fetch the data
		  request.post('http://127.0.0.1:5000/dummy-api',{json: requestBody},(error, response, apiData) => {
			if (error) {
			  vscode.window.showErrorMessage('An error occurred while making the API call.');
			  return;
			}
			const newContent = apiData;
			const newFilePath = filePath.replace(/(\.[^/.]+)$/, '_improved$1');
  
			// Save the modified content to the new file
			fs.writeFile(newFilePath, newContent, 'utf-8', (err) => {
			  if (err) {
				vscode.window.showErrorMessage('An error occurred while saving the file with improved content.');
				return;
			  }

			  vscode.window.showInformationMessage(`New file created: ${newFilePath}`);
			});

			// Create a new TextEditor with the modified content
			// { content: newContent,language:findLanguage(filePath)}
			const firstFileUri = fileUri;
			const secondFileUri = Object.assign({}, fileUri);
			secondFileUri.path = "/"+newFilePath;
			console.log(firstFileUri);
			console.log(secondFileUri);
			vscode.workspace.openTextDocument(filePath).then((firstDocument) => {
                vscode.workspace.openTextDocument(newFilePath).then((secondDocument) => {
                //   vscode.window.showTextDocument(firstDocument).then((firstEditor) => {
                    vscode.window.showTextDocument(secondDocument).then((secondEditor) => {
                      // Compare the two documents in the diff editor
                      vscode.commands.executeCommand(
                        'workbench.files.action.compareFileWith',
                        firstFileUri
                      );
                    });
                //   });
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

