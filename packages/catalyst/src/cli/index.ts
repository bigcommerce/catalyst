#!/usr/bin/env node
import { loadEnvFileFromArgv, program } from './program';

loadEnvFileFromArgv(process.argv);
program.parse(process.argv);
