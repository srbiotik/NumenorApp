import React, { Component } from 'react';
import { Text, TextInput, Button, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

import Tts, { Options } from 'react-native-tts';

import { Settings } from '../settings';
import { Utils as GameUtils } from '../utils/game';

type GameState = {
    currentNumber: string,
    gameRunning: boolean,
    currentLevel: number,
    gameLevel: any,
    numbers: Array<number>,
    operations: Array<string>,
    hits: number,
    interval: NodeJS.Timeout | null,
    scoreString: string,
    levelString: string,
    previousResult: string,
    resultInput: string,
    ttsStatus: string | null,
    selectedVoice: string | null,
    voices: Array<any> | null,
    ttsOptions: Options | undefined
}

Tts.addEventListener('tts-start', (event) => console.log('start', event));
Tts.addEventListener('tts-finish', (event) => console.log('finish', event));
Tts.addEventListener('tts-cancel', (event) => console.log('cancel', event));
export class Game extends Component {

    textInputRef: React.RefObject<TextInput> = React.createRef();
    state: GameState = {
        currentNumber: '∞',
        gameRunning: false,
        currentLevel: Settings.defaultLevel,
        gameLevel: Settings.levels[Settings.defaultLevel],
        numbers: [],
        operations: [],
        hits: 0,
        interval: null,
        scoreString: '',
        levelString: '',
        previousResult: '',
        resultInput: '',
        ttsStatus: null,
        selectedVoice: null,
        voices: null,
        ttsOptions: {
            iosVoiceId: 'com.apple.ttsbundle.Lana-compact',
            rate: 0.5,
            androidParams: {
                KEY_PARAM_PAN: -1,
                KEY_PARAM_VOLUME: 0.5,
                KEY_PARAM_STREAM: 'STREAM_MUSIC',
            }
        },

    }

    initTts = async () => {
        const voices = await Tts.voices();
        Tts.setDefaultLanguage('hr-HR');
        const availableVoices = voices
            .filter((v) => !v.networkConnectionRequired && !v.notInstalled)
            .map((v) => {
                return { id: v.id, name: v.name, language: v.language };
            });
        let selectedVoice = null;
        if (voices && voices.length > 0) {
            selectedVoice = voices[0].id;
            try {
                await Tts.setDefaultLanguage(voices[0].language);
            } catch (err) {
                //Samsung S9 has always this error:
                //"Language is not supported"
                console.log(`setDefaultLanguage error `, err);
            }
            await Tts.setDefaultVoice(voices[0].id);
            this.setNewState({ voices: availableVoices, selectedVoice, ttsStatus: 'initialized' });
        } else {
            this.setNewState({ ttsStatus: 'initialized' });
        }
    };

    setNewState = (newState: any) => {
        this.setState(() => (newState));
    };
    startGame = async () => {
        this.setNewState({
            gameRunning: true,
            gameLevel: Settings.levels[this.state.currentLevel],
            numbers: this.generateNumbers(),
            operations: this.generateOperations(),
            scoreString: null,
            levelString: null,
            hits: 0,
        });
        this.textInputRef.current?.focus();
        await this.initTts()
        this.run();
    };
    generateNumbers = () => {
        const numbers = [];
        const [start, end] = this.state.gameLevel.numRange
        for (let i = 0; i < Settings.rounds + this.state.gameLevel.n + 1; i++) {
            let number = Math.floor(Math.random() * (end - start + 1)) + start;
            numbers.push(number);
        }
        return numbers;
    }
    generateOperations = () => {
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
            await this.setCurrentNumberOperation(counter);
            if (counter == this.state.numbers.length) this.stopGame(true);
            if (counter >= this.state.gameLevel.n && counter < this.state.numbers.length) {
                if (this.state.previousResult === this.state.resultInput) {
                    this.setNewState({ hits: this.state.hits + 1 });
                }
                this.setNewState({ resultInput: '' });
                this.textInputRef.current?.focus();
                const operands = this.state.numbers.slice(counter - this.state.gameLevel.n, counter + 1);
                const operations = this.state.operations.slice(counter - this.state.gameLevel.n, counter);
                this.setNewState({ previousResult: this.calculateResult(operands, operations).toString() });
                counter++
            } else counter++
        }, this.state.gameLevel.interval * 1000);
        this.setNewState({ interval });
    }
    setCurrentNumberOperation = async (counter: number) => {
        let currentNumber: string = '';
        if (!counter) {
            currentNumber = this.state.numbers[counter].toString();
        } else {
            const operation = GameUtils.getOperationName(this.state.operations[counter - 1]);
            console.log(counter, operation)
            await Tts.speak(operation, this.state.ttsOptions);
            currentNumber = `${this.state.numbers[counter]}`;
        }
        this.setNewState({ currentNumber });
        setTimeout(() => {
            if (this.state.currentNumber === '∞') return;
            this.setNewState({ currentNumber: '' });
        }, 1000);
    }
    calculateResult = (operands: Array<number>, operations: Array<string>) => {
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
    stopGame = (natural: boolean = false) => {
        if (this.state.interval) clearInterval(this.state.interval);
        let score = GameUtils.calculateScorePercentage(this.state.hits, this.state.operations.length);
        let levelOffset = GameUtils.getLevelOffset(score, Settings.passScore, Settings.failScore);
        let scoreString = `Резултат: ${this.state.hits}/${this.state.operations.length} - ${score.toFixed(2)}%`;
        let levelString = GameUtils.getLevelString(levelOffset);
        let currentLevel = this.state.currentLevel;
        if (natural) {
            currentLevel = this.state.currentLevel + levelOffset < 0 ? this.state.currentLevel : this.state.currentLevel + levelOffset;
        }
        this.setNewState({ gameRunning: false, scoreString, levelString, currentNumber: '∞', currentLevel, resultInput: '' });
    }
    render() {
        return (
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <Button
                    title={this.state.gameRunning ? 'Стани' : 'Почни'}
                    color={this.state.gameRunning ? 'red' : 'green'}
                    onPress={() => this.state.gameRunning ? this.stopGame() : this.startGame()}
                />
                <Text style={styles.info}></Text>
                <Text style={styles.info}>{`Ниво ${this.state.currentLevel + 1}\nИзврши операције (могу бити ${this.state.gameLevel.operations.join(', ')}) над ${this.state.gameLevel.n + 1} ${this.state.gameLevel.n + 1 > 4 ? 'бројева' : 'броја'} у низу од ${this.state.gameLevel.numRange[0]} до ${this.state.gameLevel.numRange[1]}.`}</Text>
                {
                    this.state.scoreString && this.state.levelString ? <Text
                        style={styles.info}>
                        {`${this.state.scoreString}\n${this.state.levelString}`}
                    </Text> : null
                }
                <Text style={styles.arena}>{this.state.currentNumber}</Text>
                {
                    this.state.gameRunning ?
                        <TextInput
                            style={styles.textInput}
                            keyboardType='numeric'
                            ref={this.textInputRef}
                            value={this.state.resultInput}
                            onChangeText={(resultInput) => this.setNewState({ resultInput })}
                            placeholder='Upisi rezultat'
                            autoFocus={true}
                        /> : null
                }
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ddd',
        paddingTop: 40,
    },
    arena: {
        flex: 1,
        fontSize: 200,
        backgroundColor: '#ddd',
        marginHorizontal: 50,
        textAlign: 'center',
    },
    textInput: {
        height: 30,
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
