import config from './starter.config.js';
import https from 'https';
import fs from 'fs';
import {spawn, exec} from 'child_process'

class Starter {

    constructor(config) {

        this.config = config;

    }

    init() {

        this.getDependencies(this.config.dependencies);

    }

    getDependencies({dataFrom, destFile}) {

        https
            .get(dataFrom, res => {

                if (res.statusCode === 302) return this.getDependencies({dataFrom: res.headers.location, destFile});

                res
                    .on('end', () => this.installDependencies())
                    .pipe(fs.createWriteStream(destFile));


            })
            .on('error', err => process.stderr.write(`Request was terminated with error: ${err}`));

    }

    installDependencies() {

        let {stdout, stderr} = exec('npm i')
            .on('close', code => {
                process.stdout.write(`Child process exited with code: ${code}`);
                this.startNode();
            });

        stdout.pipe(process.stdout);
        stderr.pipe(process.stderr);

    }

    startNode() {

        let {entry = 'server'} = this.config.server;

        let {stdout, stderr} = spawn('node', [entry])
            .on('close', code => process.stdout.write(`Child process exited with code: ${code}`));

        stdout.pipe(process.stdout);
        stderr.pipe(process.stderr);

    }

}

(new Starter(config)).init();