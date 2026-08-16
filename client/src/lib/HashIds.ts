import Hashids from "hashids";

const hashids = new Hashids("secret one1", 2);// need to add something secret one using env vars

const encodeId = (id: string): string => {
    return hashids.encode(BigInt(id));
}

const decodeId = (hash: string): string | null => {
    const decoded = hashids.decode(hash);
    console.log("decoded array in hashid", decoded);
    return decoded.length ? decoded[0].toString() : null;
}

export { encodeId, decodeId };