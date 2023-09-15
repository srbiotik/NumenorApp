// Constructs the main game object
export class Utils {
    static calculateResult(operands: Array<number>, operations: Array<string>): number {
        let result = operands[0];
        for (let i = 1; i < operands.length; i++) {
            if (operations[i - 1] === '+') {
                result += operands[i];
            } else if (operations[i - 1] === '-') {
                result -= operands[i];
            }
        }
        return result;
    }
    static getOperationName(operation: string) {
        switch (operation) {
            case '+':
                return 'plus';
            case '-':
                return 'minus';
            case '/':
                return 'podeljeno sa';
            case '*':
                return 'puta';
        }
    }
    static getLevelString(levelOffset: number) {
        switch (levelOffset) {
            case 0:
                return 'Остајеш на истом нивоу!';
            case 1:
                return 'Прелазиш на виши ниво!';
            case -1:
                return 'Падаш један ниво ниже.';
            default:
                break;
        }
    }
    static calculateScorePercentage(hits: number, total: number): number {
        // return 100 * hits / this.operations.length;
        return 100 * hits / total;
    }
    static getLevelOffset(score: number, passScore: number, failScore: number): number {
        let levelOffset = 0;
        if (score >= passScore) {
            levelOffset = 1;
        } else if (score < failScore) {
            levelOffset = -1;
        }
        return levelOffset;
    }
}
