// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	const initProjectHandler = () => {
		// Get the project name
		let path = vscode.workspace.workspaceFolders[0].uri.fsPath;

		// Check if there is already a project here
		if (fs.existsSync(path + "/CMakeLists.txt")) {
			vscode.window.showErrorMessage("There is already a project here");
			return;
		}

		// Get the project name
		vscode.window.showInputBox({ placeHolder: "Project name" }).then(projectName => {
			initProject(path, projectName);
		});

	};

	const createClassHandler = () => {
		// Get the project name
		let path = vscode.workspace.workspaceFolders[0].uri.fsPath;

		// Get the class name
		vscode.window.showInputBox({ placeHolder: "Class name" }).then(className => {
			// Show an error if the class name is empty or it already exists
			if (className == "" || fs.existsSync(path + '/lib/' + className)) {
				vscode.window.showErrorMessage("Invalid class name");
				return;
			}

			createClass(path, className);
		});
	};
	context.subscriptions.push(vscode.commands.registerCommand('pico-tools.initProject', initProjectHandler));
	context.subscriptions.push(vscode.commands.registerCommand('pico-tools.createClass', createClassHandler));
}

function initProject(path, projectName) {
	// create the .vscode folder if it doesn't exist
	if (!fs.existsSync(path + '/.vscode')) {
		fs.mkdirSync(path + '/.vscode');
	}

	// create the launch.json file from /templates/launch.json
	fs.copyFileSync(__dirname + '/templates/launch.json', path + '/.vscode/launch.json');

	// create the settings.json file from /templates/settings.json if it doesn't exist
	if (!fs.existsSync(path + '/.vscode/settings.json')) {
		fs.copyFileSync(__dirname + '/templates/settings.json', path + '/.vscode/settings.json');
	} else {
		// if the settings.json file already exists, append the keys to it
		let settings = JSON.parse(fs.readFileSync(path + '/.vscode/settings.json'));
		let newSettings = JSON.parse(fs.readFileSync(__dirname + '/templates/settings.json'));

		for (let key in newSettings) {
			settings[key] = newSettings[key];
		}

		fs.writeFileSync(path + '/.vscode/settings.json', JSON.stringify(settings, null, 4));
	}

	// create the build folder if it doesn't exist
	if (!fs.existsSync(path + '/build')) {
		fs.mkdirSync(path + '/build');
	}

	// create the CMakeLists.txt file from /templates/CMakeLists.txt
	// replace the project name with the one the user entered
	let cmake = fs.readFileSync(__dirname + '/templates/CMakeLists.txt').toString();
	cmake = cmake.replace(/NEW_PROJECT_NAME/g, projectName);

	fs.writeFileSync(path + '/CMakeLists.txt', cmake);

	// create the main file from /templates/main.cpp
	// rename the file to the project name
	fs.copyFileSync(__dirname + '/templates/main.cpp', path + '/' + projectName + '.cpp');

	// Initialize CMake
	vscode.commands.executeCommand('cmake.configure');

	// Display a message box to the user
	vscode.window.showInformationMessage('Project created!');
}

function createClass(path, className) {
	// Add the class name to the bottom of target_link_libraries in CMakeLists.txt
	// Will be in the format:
	//target_link_libraries(${PROJECT_NAME}
	//		lib1
	//      lib2
	//      # Add other libraries here
	//	    NEW_CLASS_NAME
	//)
	let cmake = fs.readFileSync(path + '/CMakeLists.txt').toString();
	cmake = cmake.replace(/(# Add other libraries here)/g, '$1\n\t' + className);
	fs.writeFileSync(path + '/CMakeLists.txt', cmake);

	// create the lib folder if it doesn't exist
	if (!fs.existsSync(path + '/lib')) {
		fs.mkdirSync(path + '/lib');

		// create the CMakeLists.txt file from /templates/lib/CMakeLists.txt
		fs.copyFileSync(__dirname + '/templates/lib/CMakeLists.txt', path + '/lib/CMakeLists.txt');
	}
	path += '/lib';

	// Add the class name to the CMakeLists.txt file
	cmake = fs.readFileSync(path + '/CMakeLists.txt').toString();
	// if there is no newline at the end of the file, add one
	if (cmake[cmake.length - 1] != '\n') {
		cmake += '\n';
	}
	cmake += 'add_subdirectory(' + className + ')\n';
	fs.writeFileSync(path + '/CMakeLists.txt', cmake);

	// create the class folder
	fs.mkdirSync(path + '/' + className);
	path += '/' + className;

	// create the header file from /templates/class/class.h
	// replace the class name with the one the user entered
	let header = fs.readFileSync(__dirname + '/templates/class/class.h').toString();
	header = header.replace(/NEW_CLASS_NAME_UPPER/g, className.toUpperCase());
	header = header.replace(/NEW_CLASS_NAME/g, className);

	fs.writeFileSync(path + '/' + className + '.h', header);

	// create the source file from /templates/class/class.cpp
	// replace the class name with the one the user entered
	let source = fs.readFileSync(__dirname + '/templates/class/class.cpp').toString();
	source = source.replace(/NEW_CLASS_NAME/g, className);

	fs.writeFileSync(path + '/' + className + '.cpp', source);

	// Create the CMakeLists.txt file from /templates/class/CMakeLists.txt
	// replace the class name with the one the user entered
	cmake = fs.readFileSync(__dirname + '/templates/class/CMakeLists.txt').toString();
	cmake = cmake.replace(/NEW_CLASS_NAME/g, className);

	fs.writeFileSync(path + '/CMakeLists.txt', cmake);


	// Display a message box to the user
	vscode.window.showInformationMessage('Class created!');
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
