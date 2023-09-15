import React, { Component } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Keyboard } from 'react-native';
import { Settings } from '../settings';
import { Utils as GameUtils } from '../utils/game';

type GameState = {
    currentNumber: number,
    gameRunning: boolean,
    currentLevel: number,
    gameLevel: any,
    numbers: Array<number>,
    operations: Array<string>,
    hits: number,
    interval: NodeJS.Timeout | null,
    scoreString: string,
    previousResult: string,
    resultInput: string
}

export class Game extends Component {
    state: GameState = {
        currentNumber: 33,
        gameRunning: false,
        currentLevel: Settings.defaultLevel,
        gameLevel: Settings.levels[Settings.defaultLevel],
        numbers: [],
        operations: [],
        hits: 0,
        interval: null,
        scoreString: '',
        previousResult: '',
        resultInput: ''
    }
    setNewState = (newState: any) => {
        this.setState(() => (newState));
    };
    startGame = () => {
        this.setNewState({
            gameRunning: true,
            gameLevel: Settings.levels[this.state.currentLevel],
            numbers: this.generateNumbers(),
            operations: this.generateOperations(),
            hits: 0,
        });
        this.run();
    };
    generateNumbers() {
        const numbers = [];
        const [start, end] = this.state.gameLevel.numRange
        for (let i = 0; i < Settings.rounds + this.state.gameLevel.n + 1; i++) {
            let number = Math.floor(Math.random() * (end - start + 1)) + start;
            numbers.push(number);
        }
        return numbers;
    }
    generateOperations() {
        const operations = [];
        for (let i = 0; i < Settings.rounds + this.state.gameLevel.n; i++) {
            let randIndex = Math.floor(Math.random() * this.state.gameLevel.operations.length)
            operations.push(this.state.gameLevel.operations[randIndex]);
        }
        return operations;
    }
    run = () => {
        let counter = 0;
        const interval = setInterval(async () => {
            this.setCurrentNumberOperation(counter);
            if (counter == this.state.numbers.length) this.stopGame();
            if (counter >= this.state.gameLevel.n && counter < this.state.numbers.length) {
                if (this.state.previousResult === this.state.resultInput) {
                    this.setNewState({ hits: this.state.hits + 1 });
                }
                const operands = this.state.numbers.slice(counter - this.state.gameLevel.n, counter + 1);
                const operations = this.state.operations.slice(counter - this.state.gameLevel.n, counter);
                this.setNewState({ previousResult: this.calculateResult(operands, operations).toString() });
                counter++
            } else counter++
        }, this.state.gameLevel.interval * 1000);
        this.setNewState({ interval });
    }
    setCurrentNumberOperation(counter: number) {
        let currentNumber: string = '';
        if (counter == 0 || counter == this.state.numbers.length - 1) {
            currentNumber = `${this.state.numbers[counter]}`;
        } else {
            const operation = GameUtils.getOperationName(this.state.operations[counter - 1]);
            currentNumber = `${operation} ${this.state.numbers[counter]}`;
        }
        return currentNumber
    }
    calculateResult(operands: Array<number>, operations: Array<string>) {
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
    stopGame() {
        if (this.state.interval) clearInterval(this.state.interval);
        let score = GameUtils.calculateScorePercentage(this.state.hits, this.state.operations.length);
        let levelOffset = GameUtils.getLevelOffset(score, Settings.passScore, Settings.failScore);
        let scoreString = `Резултат: ${this.state.hits}/${this.state.operations.length} - ${score.toFixed(2)}%`;
        let levelString = GameUtils.getLevelString(levelOffset);
    }
    render() {
        return (
            <View style={styles.container}>
                <Button
                    title={this.state.gameRunning ? 'Стани' : 'Почни'}
                    color={this.state.gameRunning ? 'red' : 'green'}
                    onPress={() => this.state.gameRunning ? this.stopGame() : this.startGame()} />
                <Text style={styles.info}></Text>
                <Text style={styles.info}>{`Изврши операције (могу бити ${this.state.gameLevel.operations.join(', ')}) над ${this.state.gameLevel.n + 1} ${this.state.gameLevel.n + 1 > 4 ? 'бројева' : 'броја'} у низу од ${this.state.gameLevel.numRange[0]} до ${this.state.gameLevel.numRange[1]}.`}</Text>
                <Text style={styles.target}>{this.state.currentNumber}</Text>
                {
                    this.state.gameRunning ? <TextInput
                        style={styles.textInput}
                        keyboardType='numeric'
                        value={this.state.resultInput}
                        onChangeText={(resultInput) => this.setNewState({ resultInput })}
                        placeholder='Upisi rezultat'
                        autoFocus={true}
                    /> : null
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ddd',
        paddingTop: 40,
    },
    target: {
        fontSize: 200,
        backgroundColor: '#ddd',
        marginHorizontal: 50,
        textAlign: 'center',
    },
    textInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        paddingLeft: 10,
    },
    info: {
        fontSize: 16,
        marginHorizontal: 50,
        textAlign: 'center',
    }
});
