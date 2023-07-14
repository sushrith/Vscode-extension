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
	  vscode.window.showOpenDialog({ canSelectMany: true }).then((fileUris) => {
		if (fileUris && fileUris.length === 2) {
		  const firstfileUri = fileUris[0];
		  const secondfileUri = fileUris[1];

		  const filePath1 = firstfileUri.fsPath;
		  const filePath2 = secondfileUri.fsPath;

			// console.log(findLanguage(filePath));

		  // Read the file content
		  const frontend = fs.readFileSync(filePath1, 'utf-8');
		  const backend = fs.readFileSync(filePath2, 'utf-8');
  
		  const requestBody = { prompt, frontend ,backend };
			console.log(JSON.stringify(requestBody));
		  // Make an API call to fetch the data
		  request.post('http://127.0.0.1:5000/dummy-api',{json: requestBody},(error, response, apiData) => {
			if (error) {
			  vscode.window.showErrorMessage('An error occurred while making the API call.');
			  return;
			}
			const newContent1 = apiData.content1;
			const newContent2 = apiData.content2;

			const newFilePath1 = filePath1.replace(/(\.[^/.]+)$/, '_improved$1');
			const newFilePath2 = filePath2.replace(/(\.[^/.]+)$/, '_improved$1');

  
			// Save the modified content to the new file
			fs.writeFile(newFilePath1, newContent1, 'utf-8', (err) => {
			  if (err) {
				vscode.window.showErrorMessage('An error occurred while saving the file with improved content.');
				return;
			  }

			  vscode.window.showInformationMessage(`New file created: ${newFilePath1}`);
			});

			fs.writeFile(newFilePath2, newContent2, 'utf-8', (err) => {
				if (err) {
				  vscode.window.showErrorMessage('An error occurred while saving the file with improved content.');
				  return;
				}
  
				vscode.window.showInformationMessage(`New file created: ${newFilePath2}`);
			  });

			  vscode.window.onDidChangeActiveTextEditor((editor)=>{
				const fileName=path.basename(editor.document.fileName).split('.')[0];
				const filePath = editor.document.fileName;
				const newFilePath = filePath.replace(fileName, fileName+'_improved');
				console.log(fileName,filePath,newFilePath);
				if(fs.existsSync(newFilePath)){
					const firsturi = vscode.Uri.file(filePath);
					const seconduri = vscode.Uri.file(newFilePath);
					vscode.commands.executeCommand('selectForCompare', seconduri).then(()=>{
						vscode.commands.executeCommand('compareFiles', firsturi).then(()=>{
						});
					});
				}
				console.log(editor.document.fileName);
			  })
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

