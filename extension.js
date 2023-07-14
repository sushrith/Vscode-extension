const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const Diff = require('diff');
const request = require('request');

function activate(context) {
	let disposable = vscode.commands.registerCommand('autobots-m.generateCodeUsingAI', () => {
		
		const spinnerFrames = ['◴', '◷', '◶', '◵']; // Custom spinner animation frames
    	let currentFrameIndex = 0;
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
		  let frontend = '';
		  let frontendPath = '';
		  let backend = '';
		  let backendPath = '';
		  
		  if(filePath1.includes(".py")){
			backendPath=filePath1
			backend = fs.readFileSync(backendPath, 'utf-8');
		  }else if(filePath2.includes(".py")){
			backendPath=filePath2
			backend = fs.readFileSync(backendPath, 'utf-8');
		  }
		  
		  if(filePath1.includes(".js")){
			frontendPath=filePath1
			frontend = fs.readFileSync(frontendPath, 'utf-8');
		  }else if(filePath2.includes(".js")){
			frontendPath=filePath2
			frontend = fs.readFileSync(frontendPath, 'utf-8');
		  }
  
		  const requestBody = { prompt, frontend ,backend };
			console.log(JSON.stringify(requestBody));
		  // Make an API call to fetch the data
	
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Fetching data from API',
			width: 1200, // Change the width
			height: 600, // Change the height
			cancellable: false
		  },  (progress) => {
			  const interval = setInterval(() => {
				  progress.report({ message: `Updating the changes ${spinnerFrames[currentFrameIndex]}`});
				  currentFrameIndex = (currentFrameIndex + 1) % spinnerFrames.length;
				}, 120);
		request.post('https://dbpilotbackend-dot-hack-team-autobots-m.el.r.appspot.com/process',{json: requestBody},(error, response, apiData) => {
			if (error) {
			  vscode.window.showErrorMessage('An error occurred while making the API call.');
			  return;
			}
			console.log("clear interval");
			clearInterval(interval); // Stop the spinner animation
        	progress.report({ message: 'Data fetched successfully!', increment: 100 });
			const newContent1 = apiData.frontend;
			const newContent2 = apiData.backend;
			console.log(apiData);
			const newFilePath1 = frontendPath.replace(/(\.[^/.]+)$/, '_improved$1');
			const newFilePath2 = backendPath.replace(/(\.[^/.]+)$/, '_improved$1');

  
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
			});	
		} else {
		  vscode.window.showErrorMessage('Please select a file to replace its content.');
		}
	  });
	}).catch((e)=>{
		console.log(e);
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

