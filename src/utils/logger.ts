import colors from 'colors';

class Logger {
    logSuccess(message: string) : void {
        console.log(`[${colors.green('SUCCESS')}] ${message}`);
    }
    logInfo(message: string) : void {
        console.log(`[${colors.blue('INFO')}] ${message}`);
    }
    logError(message: string) : void {
        console.log(`[${colors.red('ERROR')}] ${message}`);
    }
    logWarning(message: string) : void {
        console.log(`[${colors.yellow('WARNING')}] ${message}`);
    }
}

export default new Logger();