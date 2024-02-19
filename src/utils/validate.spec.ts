import { Connection, clusterApiUrl } from '@solana/web3.js';
import { ValidatedTokensData } from '../types/types';
import { findAddedTokens, newTokensHaveMatchingOnchainMeta } from './validate';
import { expect, test } from 'vitest'

const kiki: ValidatedTokensData = {
    Name: "KiKI Token",
    Symbol: "KIKI",
    Mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    Decimals: "9",
    LogoURI: "https://arweave.net/8mAKLjGGmjKTnmcXeyr3pr7iX13xXVjJJiL6RujDbSPV",
    Line: 1085,
    "Community Validated": true,
}
const wen: ValidatedTokensData = {
    Name: "WEN",
    Symbol: "WEN",
    Mint: "WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk",
    Decimals: "5",
    LogoURI: "https://qgp7lco5ylyitscysc2c7clhpxipw6sexpc2eij7g5rq3pnkcx2q.arweave.net/gZ_1id3C8InIWJC0L4lnfdD7ekS7xaIhPzdjDb2qFfU",
    Line: 1080,
    "Community Validated": true,
}
const ele: ValidatedTokensData = {
    Name: "Elementerra",
    Symbol: "ELE",
    Mint: "8A9HYfj9WAMgjxARWVCJHAeq9i8vdN9cerBmqUamDj7U",
    Decimals: "9",
    LogoURI: "https://elementerra.s3.amazonaws.com/images/elementum.png",
    Line: 1081,
    "Community Validated": true,
}

test('xor() should find the tokens that are not in one list vs the other', () => {
    const prevTokens = [kiki];
    const tokens = [kiki, wen, ele];
    const result = findAddedTokens(prevTokens, tokens);
    expect(result.length).toBe(2);
    expect(result[0]).toBe(wen);
    expect(result[1]).toBe(ele);
});
test('xor() does not count tokens missing from the newer list', () => {
    const prevTokens = [kiki, ele];
    const tokens = [kiki, wen];
    const result = findAddedTokens(prevTokens, tokens);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(wen);
});
test('newTokensHaveMatchingOnchainMeta() works', async () => {
    const eleL: ValidatedTokensData = {
        Name: "Elementerra", // onchain says Elementum, so we should have 1 mismatch
        Symbol: "ELE",
        Mint: "8A9HYfj9WAMgjxARWVCJHAeq9i8vdN9cerBmqUamDj7U",
        Decimals: "9",
        LogoURI: "https://elementerra.s3.amazonaws.com/images/elementum.png", // onchain says JSON file, which we must parse to eventually find this .png file
        Line: 1081,
        "Community Validated": true,
    }
    const tokens = [eleL];
    const connection = new Connection(clusterApiUrl("mainnet-beta"));
    let mismatches = await newTokensHaveMatchingOnchainMeta(connection, tokens);
    expect(mismatches).toEqual(1);

    mismatches = await newTokensHaveMatchingOnchainMeta(connection, [kiki]); // everything's wrong here because the mint is actually Bonk's
    expect(mismatches).toEqual(4);

    const jupL: ValidatedTokensData = {
        Name: "Jupiter",
        Mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
        Symbol: "JUP",
        Decimals: "6",
        LogoURI: "https://static.jup.ag/jup/metadata.json", // if the submitted CSV line has a JSON, and onchain data has a JSON, we should not try to fetch the json.image.
        Line: 1,
        "Community Validated": true
    }
    mismatches = await newTokensHaveMatchingOnchainMeta(connection, [jupL]);
    expect(mismatches).toEqual(0);
});
test('newTokensHaveMatchingOnchainMeta() errors if the mint doesn\'t exist', async () => {
    const fake: ValidatedTokensData = {
        Name: "FAKETOKEN", // onchain says Elementum, so we should have 1 mismatch
        Symbol: "FAKE",
        Mint: "6JQq2qS67K4L5xQ3xUTinCyxzdPeZQG1R1ipK8jrY7gc",
        Decimals: "9",
        LogoURI: "https://elementerra.s3.amazonaws.com/images/elementum.png", // onchain says JSON file, which we must parse to eventually find this .png file
        Line: 1,
        "Community Validated": true,
    }
    const tokens = [fake];
    const connection = new Connection(clusterApiUrl("mainnet-beta"));
    let mismatches = await newTokensHaveMatchingOnchainMeta(connection, tokens);
    expect(mismatches).toEqual(1);

});