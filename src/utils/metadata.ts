import { PublicKey, Connection, clusterApiUrl, AccountInfo } from "@solana/web3.js";
import { unpackMint, getAccount, Account, Mint, TOKEN_2022_PROGRAM_ID, getMetadataPointerState, TOKEN_PROGRAM_ID, getExtensionData, ExtensionType } from "@solana/spl-token";
import { TokenMetadata as T2022Metadata, unpack } from "@solana/spl-token-metadata";
import { Metadata as MetaplexMetadata, PROGRAM_ID as METAPLEX_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { expect, test } from 'vitest';

type MetadataFinder = (connection: Connection, address: PublicKey, accInfo: AccountInfo<Buffer>) => Promise<CommonTokenMetadata | null>;

export async function findMetadata(connection: Connection, addresses: PublicKey[]): Promise<[CommonTokenMetadata[], number]> {
    let answer: CommonTokenMetadata[] = [];
    let errors = 0
    const results = await chunkedGetMultipleAccountInfos(connection, addresses);
    if (results.length !== addresses.length) {
        throw new Error(`findMetadata: expected ${addresses.length} results, but got ${results.length}`);
    }

    // oops, I refactored and findMetaplexMetadata() now needs an additional argument. I'll just use a wrapper function to fix that.
    const findMetaplexMetadataAdapter: MetadataFinder = async (connection, address, accInfo) => {
        // Assuming 'metaplex' is the desired default for pdaDerive
        return findMetaplexMetadata(connection, address, accInfo, 'metaplex');
    };
    const findCommunityMetadataAdapter: MetadataFinder = async (connection, address, accInfo) => {
        // Assuming 'metaplex' is the desired default for pdaDerive
        return findMetaplexMetadata(connection, address, accInfo, 'community');
      };
    for (let [i, result] of results.entries()) {
        if (result) {
            const metadata = await findFirstValidMetadata(connection, addresses[i], result, [findToken2022Metadata, findMetaplexMetadataAdapter, findCommunityMetadataAdapter]);
            if (metadata) {
                answer.push(metadata)
            } else {
                console.log(`could not find on-chain metadata for ${addresses[i]} to doublecheck against`)
                errors += 1
            }
        }
    }

    return [answer, errors]
}

async function findFirstValidMetadata(connection: Connection, address: PublicKey, accountInfo: AccountInfo<Buffer>, metadataFinders: MetadataFinder[]) {
    for (const finder of metadataFinders) {
        const metadata = await finder(connection, address, accountInfo);
        if (metadata) {
            return metadata; // Return the first non-null metadata found
        }
    }
    return null; // Return null if no metadata is found
}

async function findMetaplexMetadata(connection: Connection, address: PublicKey, accInfo: AccountInfo<Buffer>, pdaDerive: 'metaplex' | 'community'): Promise<CommonTokenMetadata | null> {
    // You could use getMint(), but it makes an extra RPC call to
    // getAccountInfo(), which we have to do before anyway (above). So using
    // unpackMint() saves us one RPC call.
    const mintInfo = unpackMint(address, accInfo, accInfo.owner);

    const metadataProgramId = pdaDerive === 'metaplex' ? METAPLEX_METADATA_PROGRAM_ID : COMMUNITY_METADATA_PROGRAM_ID;
    const metadataPda = findMetadataAddress(address, metadataProgramId)
    try {
        const metaplexMetadata = await MetaplexMetadata.fromAccountAddress(connection, metadataPda);
        if (!address.equals(mintInfo.address)) {
            throw new Error(`findMetaplexMetadata(${address}): sanity check failed: the Mint's address and the address you told me to look up (${address}) should be the same, but they aren't.`)
        }
        const answer: CommonTokenMetadata = {
            mint: mintInfo.address,
            name: removeEmptyChars(metaplexMetadata.data.name.trim()),
            decimals: mintInfo.decimals,
            symbol: removeEmptyChars(metaplexMetadata.data.symbol.trim()),
            uri: removeEmptyChars(metaplexMetadata.data.uri.trim())
        }
        return answer
    } catch (err) {
        return null
    }
}

async function findToken2022Metadata(connection: Connection, address: PublicKey, accInfo: AccountInfo<Buffer>): Promise<CommonTokenMetadata | null> {
    // You could use getMint(), but it makes an extra RPC call to
    // getAccountInfo(), which we have to do before anyway (above). So using
    // unpackMint() saves us one RPC call.
    const mintInfo = unpackMint(address, accInfo, accInfo.owner);
    const metadataPointer = getMetadataPointerState(mintInfo);
    const metadata = getTokenMetadata(mintInfo);
    // make sure that the metadata pointer points to the mint account (embedded metadata). Externally hosted metadata is not supported now.
    if (metadataPointer?.metadataAddress?.equals(address) && metadata && metadata.mint.equals(address)) {
        let answer: CommonTokenMetadata = {
            mint: address,
            name: removeEmptyChars(metadata.name.trim()),
            decimals: mintInfo.decimals,
            symbol: removeEmptyChars(metadata.symbol.trim()),
            uri: removeEmptyChars(metadata.uri.trim())
        }
        return answer
    }
    // let debug = `error in findToken2022Metadata(${address}), debug info: Metadata pointer should point to mint account: ${metadataPointer?.metadataAddress?.equals(address)}; Metadata should not be null: ${metadata}; Metadata.mint.equals(mint) should be true: ${metadata?.mint.equals(address)}`
    return null
}

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

/* MONOREPO */
/**
 * This is not an official program but a community deployement
 * This was deployed by the fluxbeam team and is controlled by a single signer, to allow token2022 metadata early
 **/
const COMMUNITY_METADATA_PROGRAM_ID = new PublicKey('META4s4fSmpkTbZoUsgC1oBnWB31vQcmnN8giPw51Zu');
const removeEmptyChars = (value: string) => value.replace(/\u0000/g, '');
function getTokenMetadata(mint: Mint): T2022Metadata | null {
    const data = getExtensionData(ExtensionType.TokenMetadata, mint.tlvData);
    if (data === null) {
        return null;
    }
    return unpack(data);
}
async function chunkedGetMultipleAccountInfos(
    connection: Connection,
    pks: PublicKey[],
    chunkSize: number = 100,
) {
    const chunks = function <T>(array: T[], size: number): T[][] {
        return Array.apply<number, T[], T[][]>(0, new Array(Math.ceil(array.length / size))).map((_, index) =>
            array.slice(index * size, (index + 1) * size),
        );
    }
    return (await Promise.all(chunks(pks, chunkSize).map((chunk) => connection.getMultipleAccountsInfo(chunk)))).flat();
}
function findMetadataAddress(mint: PublicKey, metadataProgramId: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('metadata'), metadataProgramId.toBuffer(), mint.toBuffer()],
        metadataProgramId,
    )[0];
}
// TokenMetadata is agnostic across Token 2022, Metaplex or Fluxbeam type metadata
interface CommonTokenMetadata {
    mint: PublicKey;
    name: string;
    decimals: number,
    symbol: string;
    uri: string;
}