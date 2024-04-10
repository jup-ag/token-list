import { expect, test } from 'vitest';
import { PublicKey, Connection, clusterApiUrl, AccountInfo } from "@solana/web3.js";
import { findMetadata } from './metadata';

const JUP = new PublicKey('JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'); // Metaplex metadata
const BERN = new PublicKey('CKfatsPMUf8SkiURsDXs7eK6GWb4Jsd6UDbs7twMCWxo'); // Community metadata
const GHOST = new PublicKey('HbxiDXQxBKMNJqDsTavQE7LVwrTR36wjV2EaYEqUw6qH'); // Token2022 Metadata extension
test('should work with a Token2022 mint', async () => {
    const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
    let t2022Meta = await findMetadata(connection, [GHOST])
    expect(t2022Meta).toMatchSnapshot()
})
test('should work with a Token/Metaplex-metadata mint', async () => {
    const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
    let t2022Meta = await findMetadata(connection, [JUP])
    expect(t2022Meta).toMatchSnapshot()
})
test('should work with a Token2022/Community-metadata mint', async () => {
    const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
    let metadata = await findMetadata(connection, [BERN])
    expect(metadata).toMatchSnapshot()
})
test('should work with a list of mints', async () => {
    const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
    let metadata = await findMetadata(connection, [JUP, BERN, GHOST])
    expect(metadata).toMatchSnapshot()
})