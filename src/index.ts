import { ApiPromise, WsProvider } from '@polkadot/api';
import { MerkleTree } from 'merkletreejs';
import sha256 from 'crypto-js';
import stringifyLib from 'json-stable-stringify';

interface MerkleTreeObject {
    duplicateOdd: boolean,
    fillDefaultHash: undefined,
    hashLeaves: boolean,
    isBitcoinTree: boolean,
    layers: [],
    leaves: Array<LeavesMerkleTree>,
    sort: boolean,
    sortLeaves: boolean,
    sortPairs: boolean
}

interface LeavesMerkleTree {
    data: Uint8Array,
    type: string
}

interface BaseData {
    root: string;
}

export interface Merkle {
    tree: string;
    root: string;
}

interface DataBase<T extends BaseData> {
    set(value: T): void
    get(root: string): T | undefined;
}

class InMemoryDatabase<T extends BaseData> implements DataBase<T> {
    private db: Record<string, T> = {};

    public set(value: T): void {
        this.db[value.root] = value; 
    }

    public get(root: string) : T | undefined {
        return this.db[root] 
    }
    
}

const instanceDB = new InMemoryDatabase<Merkle>();
const tree = new MerkleTree([], sha256.SHA256);

let queryHeader: any;
let merkleRoot: string = "";

const ok = await loadHeaders()

console.log("Last merkle tree root: " + merkleRoot)
console.log("Header number to query: " + queryHeader.number)

const treeInstance = instanceDB.get(merkleRoot)
const queryHeaderSerialized = stringifyLib(queryHeader)
const prefix = "0x"
let queryHeaderHashed = sha256.SHA256(queryHeaderSerialized).toString()
queryHeaderHashed = prefix.concat(queryHeaderHashed)

if (treeInstance?.tree) {
    let obj: MerkleTreeObject = JSON.parse(treeInstance?.tree)

    let leaves: any[] = []

    obj.leaves.forEach(leaf => {
        leaves.push(new Uint8Array(leaf.data))
    })

    let newTree = new MerkleTree(leaves, sha256.SHA256)
    let proof = newTree.getHexProof(queryHeaderHashed)
    console.log("This is your proof of concept: ", proof)

    newTree.getProofIndices
    console.log("Verifying your proof...")
    let ok = newTree.verify(proof, queryHeaderHashed, treeInstance?.root)
    console.log("Your verification was " + ok)
}

process.exit(0)

async function loadHeaders(): Promise<boolean> {
    const wsProvider = new WsProvider('wss://rpc.polkadot.io');
    const api = await ApiPromise.create({ provider: wsProvider });
    await api.rpc.system.chain();

    await api.rpc.chain.subscribeNewHeads((lastHeader) => {
            const serializeHeader = stringifyLib(lastHeader)
            let bufHeader = Buffer.from(serializeHeader);
            tree.addLeaf(bufHeader, true)
    
            let serializeTree = stringifyLib(tree)
            let root = tree.getHexRoot()
        
            instanceDB.set({
                tree: serializeTree,
                root: root,
            })
            merkleRoot = root
            queryHeader = lastHeader 
    });

    console.log("Waiting for headers...")
    await delay(20000);
    return true;
}

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}







