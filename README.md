# BackupManager
![Screenshot](backupmanager.PNG)
## Instructions
### Saving Code
- If any version of code is selected (i.e. highlighed in green), press the ```Esc``` key to deselect it.
- Type the description of the changes you have made since last saving the code in the box at the top left corner.
- If this version of code was used at a competition, press the ```Comp``` button. It should turn green. This is an optional step, but it is recommended to help organize your code.
- Press the green save button.
### Loading Code
- Ensure you have saved your code so that you don't lose any progress.
- Select the version you want to go back two. It should turn green.
- Press the green load button.
- You will receive one last warning reminding you to save your code. If you have, press ```OK```, otherwise press ```Cancel``` and go back to step 1.
- Depending on your IDE, you may have to relaunch it to see the changes take effect.
## Easy Install
Coming Soon
(soon meaning possibly sometime)
## Manual Install
### 1. Clone this repository
### 2. Fill out config.json
```json
{
  "codeDir": "BASE DIRECTORY OF YOUR CODE",
  "remote": "PATH TO A GIT REPOSITORY STORED ON A FLASH DRIVE OR ON THE FILESYSTEM",
  "lastCommit": "master (don't change this)" 
}
```
The code folder should be something like ```src/main/java/frc``` for teams using Java.
Other folders may work as long as they contain the code and stay consistent.
### 3. Install the dependencies
Assuming you have [NodeJS](https://nodejs.org) installed, type the command ```npm i``` into your terminal.
### 4. Build the Executable
Next run the command ```npm run make``` to build your executable.
