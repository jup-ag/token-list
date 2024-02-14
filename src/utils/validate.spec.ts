import { ValidatedTokensData } from '../types/types';
import { findAddedTokens } from './validate';
import { expect, test } from 'vitest'

const tok1: ValidatedTokensData = {
    Name: "KiKI Token",
    Symbol: "KIKI",
    Mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    Decimals: "9",
    LogoURI: "https://arweave.net/8mAKLjGGmjKTnmcXeyr3pr7iX13xXVjJJiL6RujDbSPV",
    Line: 1085,
    "Community Validated": true,
}
const tok2: ValidatedTokensData = {
    Name: "WEN",
    Symbol: "WEN",
    Mint: "WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk",
    Decimals: "5",
    LogoURI: "https://shdw-drive.genesysgo.net/GwJapVHVvfM4Mw4sWszkzywncUWuxxPd6s9VuFfXRgie/wen_logo.png",
    Line: 1080,
    "Community Validated": true,
}
const tok3: ValidatedTokensData = {
    Name: "Elementerra",
    Symbol: "ELE",
    Mint: "8A9HYfj9WAMgjxARWVCJHAeq9i8vdN9cerBmqUamDj7U",
    Decimals: "9",
    LogoURI: "https://elementerra.s3.amazonaws.com/images/elementum.png",
    Line: 1081,
    "Community Validated": true,
}

test('xor() should find the tokens that are not in one list vs the other', () => {
    const prevTokens = [tok1];
    const tokens = [tok1, tok2, tok3];
    const result = findAddedTokens(prevTokens, tokens);
    expect(result.length).toBe(2);
    expect(result[0]).toBe(tok2);
    expect(result[1]).toBe(tok3);
});
test('xor() does not count tokens missing from the newer list', () => {
    const prevTokens = [tok1, tok3];
    const tokens = [tok1, tok2];
    const result = findAddedTokens(prevTokens, tokens);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(tok2);
});
