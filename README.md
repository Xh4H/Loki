<div align="center">
    <p> <img src="https://xh4h.com/uploads/loki.png" alt="Discord.jl"/> </p>
</div>

<div align="center">
 <a href="https://www.npmjs.org/package/@xh4h/loki"><img src="https://badgen.net/npm/v/loki-vuln" alt="npm version"/></a>
 <a href="https://www.npmjs.org/package/@xh4h/loki"><img src="https://badgen.net/npm/license/loki-vuln" alt="license"/></a>
 <a href="https://www.npmjs.org/package/@xh4h/loki"><img src="https://badgen.net/npm/dt/loki-vuln" alt="downloads"/></a>
 <a href="./SECURITY.md"><img src="https://img.shields.io/badge/Security-Responsible%20Disclosure-yellow.svg" alt="Responsible Disclosure Policy" /></a>
 <a href="./LICENSE"><img src="https://badgen.net/github/license/Xh4H/Loki" alt="License" /></a>
</div>

**Loki** helps to identify `NodeJS` projects that are vulnerable to **Dependency Confusion supply chain** attacks.

**Loki** has been created with the goal of helping developers to scan their projects and identifying possible attack vectors that could take advantage of vulnerabilities in the dependency supply chain.

## Disclaimer
**Loki** is a PoC. The attack mode simply inserts a payload opening a listener service to allow the developer to connect to the compromised dependency with the sole purpose of showing the impact of a misconfigured module.

## When may a Dependency Confusion supply chain attack happen?
**Dependency Confusion** attacks may occur if:
* A company uses a hybrid approach to download their dependencies from both their internal repositories and public repositories.
* A developer has not properly configured a project's `npm` registry. A lightweight private npm proxy registry such as [Verdaccio](https://verdaccio.org/) can be configured.
* A typo in the name of a dependency may lead to an untrusted dependency being downloaded from the wrong repository. Better known as typosquatting.
* The version specified of the wanted dependency in the `package.json` file allows downloading newer versions. Having such `"loki-this-dependency-does-not-exist": "^1.1.0"` dependency allows downloading the latest version of the dependency from `1.1.0` up to, but not including, `2.0.0`. Similar interaction happens with `tilde` `~`. If a project has an hybrid setup, if the public repository `such as npmjs.org` contains a higher version compared with the private repository, the public one will be downloaded.
* A package name has a different import name. If a junior developer, by reading the code, expects the installation name of a package used in the repository is the same as the `import`. As an example, we can have a look at the Python image processing library `OpenCV` whose import name is `cv2` but the correct `pip install` command to install it is `pip install opencv-python`.

## Mitigation
* Strict internal dependency management by configuring the private repository to never go beyond (access the public realm) when it does not contain the wanted dependency. As previously said, [Verdaccio](https://verdaccio.org/) is a nice tool to achieve this.
* Using dependency scopes or namespaces to avoid typosquatting.
* Using version pinning. This technique does not index whether your current dependencies have been compromised, but it will prevent from downloading newer untrusted versions.
* Integrity checking. 

## Features

* Dependency scanning
* npmjs package publishing
* Configurable reverse shell generation
* Payload injection in vulnerable projects
* Attack mode (PoC after successful payload injection)
* Inspector mode (display hash of commit that introduced the vulnerable package if the directory to scan is a git repository)


## Usage
```
$ loki [options]

Options
--directory   -d   Path to directory to scan
--entrypoint  -e   Path to file to execute if directory is vulnerable (defaults to index.js)
--inspect     -i   Enable inspector mode
--accesstoken -a   Access token for npmjs.com
--attack           Whether to attack the project
--host             Host IP where the reverse shell lister is running (defaults to localhost)
--port             Port where the reverse shell lister is running (defaults to 1456)
```

## Example

<div align="center">
    <p> <img src="https://xh4h.com/uploads/loki-carbon.png" alt="Loki example"/> </p>
</div>


## 
