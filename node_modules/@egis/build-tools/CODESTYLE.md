## Git Commit Guidelines
(stolen from https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md)

We have very precise rules over how our git commit messages can be formatted. This leads to more readable messages that are easy to follow when looking through the project history.

The commit message formatting can be added using a typical git workflow or through the use of a CLI wizard (Commitizen). To use the wizard, run npm run commit in your terminal after staging your changes in git.

### Commit Message Format
Each commit message consists of a header, a body and a footer. The header has a special format that includes a type, a scope and a subject:

`<type>: <subject>`

Any line of the commit message cannot be longer 100 characters! This allows the message to be easier to read on GitHub as well as in various git tools.

## Revert
If the commit reverts a previous commit, it should begin with revert:, followed by the header of the reverted commit. In the body it should say: This reverts commit <hash>., where the hash is the SHA of the commit being reverted.

### Type
Must be one of the following:

feat: A new feature  
fix: A bug fix  
revert: Revert a previous commit  
docs: Documentation only changes  
style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)  
refactor: A code change that neither fixes a bug nor adds a feature  
perf: A code change that improves performance  
test: Adding missing tests  
chore: Changes to the build process or auxiliary tools and libraries such as documentation generation  

## Code Style
```javascript
class CamelCaseClasses {

	constructor(options) {
		super(options);
	}
	
	get value() {
		return this._value;
	}
	
	set value(value) {
		this._value = value;
	}
	
	/** @ignore **/
	privateMethod() {
	
	}
	
	camelCaseMethods(arg1, arg2) {
	
		// 2.D.1.1
		if (condition) {
		  // statements
		}

		while (condition) {
		  // statements
		}

		for (var i = 0; i < 100; i++) {
		  // statements
		}

		if (true) {
		  // statements
		} else {
		  // statements
		}  
        }
}
```
