import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Helmet } from 'react-helmet';

import WordSelector from '../components/WordSelector';
import { IoLogoGithub } from 'react-icons/io';

import { colors, breakpoints } from '../styles';

// english only for now, TODO: add other languages
import WORDLIST from '../wordlists';

import axios from 'axios';

import {
    ENTROPY_BITS_MAP,
    LENGTH_OPTIONS,
    getDetails,
    getSeed,
    generateRandomMnemonic,
    mnemonicFromEntropy,
    zeroFill,
} from '../utils';
import debounce from 'lodash.debounce';

const GlobalStyles = createGlobalStyle`
    body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
            'Segoe UI Symbol';
        box-sizing: border-box;
        div, input, textarea
        {
            box-sizing: inherit;
        }
        color: ${colors.textPrimary};
        @media (${breakpoints.phone}) {
            font-size: 13px;
        }
        input, textarea {
            -webkit-appearance: none;
        }
    }
`;

const Title = styled.h1`
    font-size: 24px;
    font-weight: bold;
    text-align: center;
`;

const Header = styled.h2`
    font-size: 20px;
    margin-bottom: 4px;
`;

const Subheader = styled.span`
    font-size: 16px;
    font-weight: normal;
    color: ${colors.textSecondary};
    margin-left: 8px;
`;

const CenteredRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    > textarea {
        border: 1px solid ${colors.textPrimary};
        border-radius: 3px;
        width: 90%;
        max-width: 500px;
        height: 40px;
        margin-top: 8px;
        @media (${breakpoints.phone}) {
            font-size: 16px;
        }
    }
`;

const CountContainer = styled.div`
    display: flex;
    border: 1px solid;
    border-radius: 4px;
    margin: 0 10px;
`;

const RadioGroupLabel = styled.label`
    margin: 8px 0;
`;

const CountLabel = styled.label`
    padding: 8px 16px;
    cursor: pointer;
    border-right: 1px solid;
    &:hover {
        background-color: ${colors.bgHover};
    }
    &.selected {
        color: ${colors.textSelected};
        background-color: ${colors.bgSelected};
    }
    &:first-child {
        border-radius: 4px 0 0 4px;
    }
    &:last-child {
        border-right: none;
        border-radius: 0 4px 4px 0;
    }
`;

const CountRadio = styled.input.attrs(() => ({
    type: 'radio',
    name: 'wordcount',
}))`
    position: absolute;
    opacity: 0;
    cursor: pointer;
`;

const GenerateButton = styled.button`
    padding: 6px 20px;
    background-color: ${colors.bgAccent};
    border: 2px solid ${colors.bgAccent};
    color: ${colors.textAccent};
    border-radius: 18px;
    outline: none;
    cursor: pointer;
    font-size: 14px;
    margin: 10px;
    &:hover {
        box-shadow: ${colors.bgAccent} 0 0 0 2px;
    }
    transition-property: box-shadow;
    transition-duration: 0.1s;
`;

const ResetButton = styled(GenerateButton)`
    background-color: transparent;
    color: ${colors.bgAccent};
`;

const FlexRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    margin: 20px;
    @media (${breakpoints.phone}) {
        margin: 8px;
    }
`;

const FlexItem = styled.div`
    flex: 0 0 16.6%;
    padding: 8px;
    @media (${breakpoints.tablet}) {
        flex: 0 0 33.3%;
    }
`;

const DetailsContainer = styled.div`
    margin: 20px;
    input {
        padding: 4px;
        border: 1px solid;
        border-radius: 3px;
        margin: 4px 0;
        font-size: 16px;
    }
    @media (${breakpoints.phone}) {
        margin: 8px;
    }
`;

const WordWithIndex = styled.div`
    display: inline-block;
    border: 1px solid;
    border-radius: 3px;
    padding: 4px;
    margin: 4px;
    margin-left: 0;
    > div > span {
        color: ${colors.textSecondary};
        font-size: 13px;
    }
    > div:last-child {
        font-size: 11px;
    }
`;

const DetailsLabel = styled.span`
    display: block;
    font-weight: bold;
    font-size: 12px;
`;

const LongString = styled.span`
    display: inline-block;
    word-break: break-all;
    padding: 4px;
    margin: 4px 0;
    border: 1px solid;
    border-radius: 3px;
    background-color: ${colors.bgSecondary};
`;

const GithubLink = styled(IoLogoGithub)`
    color: ${colors.textPrimary};
`;

const WordCount = props => {
    const { value, onChange } = props;
    return (
        <CenteredRow>
            <RadioGroupLabel>Length</RadioGroupLabel>
            <CountContainer>
                {LENGTH_OPTIONS.map(count => {
                    const isSelected = value === count;
                    return (
                        <CountLabel
                            key={`wc${count}`}
                            className={isSelected ? 'selected' : null}
                        >
                            <CountRadio
                                key={count}
                                value={count}
                                checked={isSelected}
                                onChange={() => onChange && onChange(count)}
                            />
                            <span>{count}</span>
                        </CountLabel>
                    );
                })}
            </CountContainer>
        </CenteredRow>
    );
};

class App extends React.Component {
    constructor(props) {
        super(props);
        this.textAreaRef = React.createRef();
        this.state = {
            wordCount: 24,
            words: new Array(24),
            wordList: WORDLIST,
            validLastWords: [],
            isCompleted: false,
            entropyInput: '',
            seed: '',
            passphrase: '',
            segwit: '',
            p2sh: '',
        };
    }

    handleCountChange = wordCount => {
        const { words, wordList, passphrase, entropyInput } = this.state;
        const updatedWords = entropyInput
            ? mnemonicFromEntropy(entropyInput, wordCount, wordList)
            : [...new Array(wordCount)].map((val, i) => words[i]);
        const details = getDetails(updatedWords, wordList);
        const { validLastWords, isCompleted } = details;
        if (isCompleted && !entropyInput) {
            updatedWords[wordCount - 1] = validLastWords[0];
        }
        this.setState({
            wordCount,
            words: updatedWords,
            validLastWords: [],
            ...getDetails(updatedWords, wordList),
            seed: isCompleted ? getSeed(updatedWords, passphrase) : '',
            passphrase: isCompleted ? passphrase : '',
            segwit: '',
            p2sh: '',
        });
        let req_segwit = 'http://localhost:3000/segwit_address_generator/';
        words.forEach(word => {
            req_segwit += word;
            if(word != words[words.length - 1])
                req_segwit += '%20';
            else {
                req_segwit += '/m%2F84%27%2F0%27%2F0%27%2F0';
            }
        });
        axios.get(req_segwit).then((response) => {
            this.setState({
                segwit: response.data,
            });
        });
        let req_p2sh = 'http://localhost:3000/multisig/2/3/02e135e12b4417b41e92e738448cb51581c70f14bf885b0d4056ac2c3cc5c8729c,022015b568fb0f2f792e2e1d230a7f64e8a75b5d4a3ae549b55c3724cdc148b32c,02799dc04a8acf04e793ff0f2c35c20c0388529eb964c565a455f13c07123c9ea2';
        axios.get(req_p2sh).then((response) => {
            this.setState({
                p2sh: response.data,
            });
        });
    };

    handleGenerate = () => {
        const { wordCount, wordList, passphrase } = this.state;
        const words = generateRandomMnemonic(wordCount, wordList);
        this.setState({
            words,
            ...getDetails(words, wordList),
            entropyInput: '',
            seed: getSeed(words, passphrase),
            segwit: '',
            p2sh: '',
        });
        this.textAreaRef.current.value = '';
        let req_segwit = 'http://localhost:3000/segwit_address_generator/';
        words.forEach(word => {
            req_segwit += word;
            if(word != words[words.length - 1])
                req_segwit += '%20';
            else {
                req_segwit += '/m%2F84%27%2F0%27%2F0%27%2F0';
            }
        });
        axios.get(req_segwit).then((response) => {
            console.log(response)
            this.setState({
                words,
                ...getDetails(words, wordList),
                entropyInput: '',
                seed: getSeed(words, passphrase),
                segwit: response.data,
            });
        });
        let req_p2sh = 'http://localhost:3000/multisig/2/3/02e135e12b4417b41e92e738448cb51581c70f14bf885b0d4056ac2c3cc5c8729c,022015b568fb0f2f792e2e1d230a7f64e8a75b5d4a3ae549b55c3724cdc148b32c,02799dc04a8acf04e793ff0f2c35c20c0388529eb964c565a455f13c07123c9ea2';
        axios.get(req_p2sh).then((response) => {
            this.setState({
                words,
                ...getDetails(words, wordList),
                entropyInput: '',
                seed: getSeed(words, passphrase),
                p2sh: response.data,
            });
        });
    };

    handleReset = () => {
        const { wordCount } = this.state;
        this.setState({
            words: new Array(wordCount),
            isCompleted: false,
            validLastWords: [],
            entropyInput: '',
            seed: '',
            passphrase: '',
            segwit: '',
            p2sh: '',
        });
        this.textAreaRef.current.value = '';
    };

    handleEntropy = e => {
        this.handleEntropyDebounce(e.target.value);
    };

    handleEntropyDebounce = debounce(entropyInput => {
        if (!entropyInput) {
            this.handleReset();
            return;
        }
        const { wordCount, wordList, passphrase } = this.state;
        const words = mnemonicFromEntropy(entropyInput, wordCount, wordList);
        this.setState({
            words,
            entropyInput,
            ...getDetails(words, wordList),
            seed: getSeed(words, passphrase),
            segwit: '',
            p2sh: '',
        });
    }, 250);

    handleChange = ({ word, index }) => {
        const { wordCount, words, wordList, passphrase } = this.state;
        const updatedWords = [...new Array(wordCount)].map((val, i) => {
            return i === index ? word : words[i];
        });
        const details = getDetails(updatedWords, wordList);
        const { validLastWords, isCompleted } = details;
        if (isCompleted && index !== wordCount - 1) {
            updatedWords[wordCount - 1] = validLastWords[0];
        }

        this.setState({
            words: updatedWords,
            ...getDetails(updatedWords, wordList),
            entropyInput: '',
            seed: getSeed(updatedWords, passphrase),
            segwit: '',
            p2sh: '',
        });
        this.textAreaRef.current.value = '';
        let req_segwit = 'http://localhost:3000/segwit_address_generator/';
        words.forEach(word => {
            req_segwit += word;
            if(word != words[words.length - 1])
                req_segwit += '%20';
            else {
                req_segwit += '/m%2F84%27%2F0%27%2F0%27%2F0';
            }
        });
        axios.get(req_segwit).then((response) => {
            console.log(response)
            this.setState({
                words,
                ...getDetails(words, wordList),
                entropyInput: '',
                seed: getSeed(words, passphrase),
                segwit: response.data,
            });
        });
        let req_p2sh = 'http://localhost:3000/multisig/2/3/02e135e12b4417b41e92e738448cb51581c70f14bf885b0d4056ac2c3cc5c8729c,022015b568fb0f2f792e2e1d230a7f64e8a75b5d4a3ae549b55c3724cdc148b32c,02799dc04a8acf04e793ff0f2c35c20c0388529eb964c565a455f13c07123c9ea2';
        axios.get(req_p2sh).then((response) => {
            this.setState({
                words,
                ...getDetails(words, wordList),
                entropyInput: '',
                seed: getSeed(words, passphrase),
                p2sh: response.data,
            });
        });
    };

    handlePassphrase = e => {
        this.handlePassphraseDebounce(e.target.value);
    };

    handlePassphraseDebounce = debounce(passphrase => {
        const { words } = this.state;
        this.setState({
            seed: getSeed(words, passphrase),
            passphrase,
            segwit: '',
            p2sh: '',
        });
    }, 250);

    renderWordWithIndex = (word, i) => {
        const { wordList } = this.state;
        const listIndex = wordList.indexOf(word);
        const binary = zeroFill(listIndex.toString(2), 11);
        return (
            <WordWithIndex key={`wi${i}`}>
                <div>
                    <strong>{word}</strong> <span>{listIndex}</span>
                </div>
                <div>{binary}</div>
            </WordWithIndex>
        );
    };

    render() {
        const {
            words,
            wordCount,
            wordList,
            validLastWords,
            entropy,
            checksum,
            seed,
            isCompleted,
            segwit,
            p2sh,
        } = this.state;
        // console.log(this.state);
        // console.log(words.join(' '));
        const wordSelectors = [];
        const entropyBits = ENTROPY_BITS_MAP[wordCount];
        const leftoverBits = entropyBits - 11 * (wordCount - 1);
        const totalBits = entropyBits + (checksum || {}).length;

        for (let i = 0; i < wordCount; i++) {
            let isLastWord = i === wordCount - 1;
            wordSelectors.push(
                <FlexItem key={`word${i}`}>
                    <WordSelector
                        index={i}
                        indexDisplay={i + 1}
                        word={words[i] || ''}
                        wordList={isLastWord ? validLastWords : wordList}
                        disabled={validLastWords.length === 0}
                        onChange={this.handleChange}
                    />
                </FlexItem>
            );
        }

        return (
            <div>
                <GlobalStyles />
                <Helmet>
                    <title>BIP39 Mnemonic Builder</title>
                    <meta
                        name="description"
                        content="Create a BIP39 custom recovery seed phrase for your bitcoin wallet."
                    ></meta>
                </Helmet>
                <Title>BIP39 Mnemonic Builder (HD SegWit bitcoin address)</Title>
                <CenteredRow>
                    <WordCount
                        value={wordCount}
                        onChange={this.handleCountChange}
                    />
                    <GenerateButton onClick={this.handleGenerate}>
                        Generate Random
                    </GenerateButton>
                    <ResetButton onClick={this.handleReset}>Reset</ResetButton>
                </CenteredRow>
                <CenteredRow>
                    <textarea
                        ref={this.textAreaRef}
                        placeholder="Optional user provided entropy. Type randomly here to generate a random mnemonic."
                        onChange={this.handleEntropy}
                    />
                </CenteredRow>
                <FlexRow>{wordSelectors}</FlexRow>
                {isCompleted ? (
                    <DetailsContainer>
                        <Header>
                            Entropy - {entropyBits} bits
                            <Subheader>
                                {wordCount - 1} words &times; 11 bits ={' '}
                                {entropyBits - leftoverBits} bits +{' '}
                                {leftoverBits} extra bits ={' '}
                                {Math.pow(2, leftoverBits)} valid last words
                            </Subheader>
                        </Header>
                        <LongString>{entropy.hex}</LongString>
                        <Header>
                            Checksum - {checksum.length} bits
                            <Subheader>
                                First {checksum.length} bits of SHA-256 hash of
                                entropy
                            </Subheader>
                        </Header>
                        <div>
                            <DetailsLabel>Hash</DetailsLabel>
                            <LongString>{checksum.hash}</LongString>
                        </div>
                        <div>
                            <DetailsLabel>
                                First {checksum.length} bits
                            </DetailsLabel>
                            <LongString>{checksum.firstBits}</LongString>
                        </div>
                        <Header>
                            Result - {totalBits} bits
                            <Subheader>
                                Entropy + checksum = {wordCount} words &times;
                                11 bits = {totalBits}. Word / index / binary
                                index.
                            </Subheader>
                        </Header>
                        <div>{words.map(this.renderWordWithIndex)}</div>
                        <Header>
                            Seed - 512 bits
                            <Subheader>
                                PBKDF2 - SHA-512 / 2048 iterations
                            </Subheader>
                        </Header>
                        <div>
                            <DetailsLabel>Optional Passphrase</DetailsLabel>
                            <input
                                type="text"
                                onChange={this.handlePassphrase}
                            />
                        </div>
                        <LongString>{seed}</LongString>
                        <Header>
                            Hierarchical Deterministic (HD) Segregated Witness (SegWit) bitcoin address
                            <Subheader>
                                HD SegWit bitcoin wallet address
                            </Subheader>
                        </Header>
                        <LongString>{segwit}</LongString>
                        <Header>
                            n-out-of-m Multisignature Pay-To-Script-Hash address
                            <Subheader>
                                multi-sig P2SH addr
                            </Subheader>
                        </Header>
                        <LongString>{p2sh}</LongString>
                    </DetailsContainer>
                    
                ) : null}
            </div>
        );
    }
}

export default App;
