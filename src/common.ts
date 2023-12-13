import { KeyringPair } from "@polkadot/keyring/types";
import { decodeAddress, signatureVerify } from '@polkadot/util-crypto';
import { ApiPromise } from '@polkadot/api';
import fs from "fs";
import { promisify } from "util";

import { blake2AsU8a } from '@polkadot/util-crypto';
import { u8aToHex } from "@polkadot/util";
import path from "path";

export const ROOT_DIR = '/tmp/paymentChannels';
export const extrinsicsMap = new Map<string, boolean>();

interface Channel {
    id: string,
    organization: string,
    service: string,
    version: number,
    owner: string,
    counter: number,
    price: string,
    calls: number,
    expiration: number,
}

export const setupDirs = (dir: string = ROOT_DIR) => {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (error: any) {
      if (error.code !== "EEXIST") {
        console.error(`[ERROR] Failed to create directories [${dir}]: ${error.message}`);
        process.exit(1);
      }
    }
}

export const blockTracker = async (api: ApiPromise) => {
    let blockNumber = -1;
    const unsubscribe = await api.rpc.chain.subscribeNewHeads(async (header) => {
        if (blockNumber != header.number.toNumber()) {
          const block = (await api.rpc.chain.getBlock(header.hash)!).block;
          for (let i = 0; i < block.extrinsics.length; i++) {
            extrinsicsMap.set(block.extrinsics[i].hash.toString(), true);
          }
          blockNumber = header.number.toNumber();
        }
    });
}

export const hashName = (api: ApiPromise, owner: string, name: string) => {
    const constantBytes = new TextEncoder().encode('modlpy/paych____');
    let nameBytes = api.registry.createType('Vec<u8>', name).toU8a();
    const publicKey = decodeAddress(owner);
    const message = new Uint8Array([...constantBytes, ...publicKey, ...nameBytes]);
    return blake2AsU8a(message);
}

export const hashChannelId = (owner: string, organizationIdBytes: Uint8Array, serviceIdBytes: Uint8Array) => {
    const constantBytes = new TextEncoder().encode('modlpy/paych____');
    const publicKey = decodeAddress(owner);
    const message = new Uint8Array([...constantBytes, ...publicKey, ...organizationIdBytes, ...serviceIdBytes]);
    return blake2AsU8a(message);
}

export const getOrganizationsByOwner = async (api: ApiPromise, owner: string) => {
    const organizations: any[] = [];
    const queryOrgStorage = await api.query.paymentChannels.organizations.entries(owner);
    queryOrgStorage.forEach(([{ args: [owner, id] }, organization]) => {
        console.log(`\n(OrgOwner, OrgId): (${owner}, ${id})\n\n${JSON.stringify(organization, null, 2)}`);
        organizations.push(organization.toHuman());
    });
    return organizations;
}

export const getServicesByOrgId = async (api: ApiPromise, orgId: string) => {
    const services: any[] = [];
    const querySrvStorage = await api.query.paymentChannels.services.entries(orgId);
    querySrvStorage.forEach(([{ args: [orgId, serviceId] }, service]) => {
        console.log(`\n(OrgId, SrvId): (${orgId}, ${serviceId})\n\n${JSON.stringify(service, null, 2)}`);
        services.push(service.toHuman());
    });
    return services;
}

export const getChannelsByOwner = async (api: ApiPromise, owner: string) => {
    const channels: any[] = [];
    const queryChnStorage = await api.query.paymentChannels.channels.entries(owner);
    queryChnStorage.forEach(([{ args: [owner, id] }, channel]) => {
        console.log(`\n(owner, channelId): (${owner}, ${id})\n\n${JSON.stringify(channel, null, 2)}`);
        channels.push(channel.toHuman());
    });
    return channels;
}

export const getChannel = async (api: ApiPromise, owner: string, channelId: string): Promise<Channel> => {
    const query = await api.query.paymentChannels.channels(owner, channelId);
    const c = JSON.parse(query.toString());
    const channel: Channel = {
        id: "",
        organization: "",
        service: "",
        version: 1,
        owner: "",
        counter: 0,
        price: "",
        calls: 0,
        expiration: 0,
        ...c,
    };
    return channel;
}

export const buildMessage = (api: ApiPromise, channelIdBytes: Uint8Array, version: number, counter: number) => {
    const constantBytes = new TextEncoder().encode('modlpy/paych____');
    const c = api.registry.createType('u32', counter).toU8a();
    const v = api.registry.createType('u32', version).toU8a();
    return blake2AsU8a(new Uint8Array([...constantBytes, ...channelIdBytes, ...v, ...c]));
}

export const signChannelCounter = (
    api: ApiPromise,
    signer: KeyringPair,
    channelIdBytes: Uint8Array,
    version: number,
    counter: number,
): [Uint8Array, Uint8Array] => {
    const message = buildMessage(api, channelIdBytes, version, counter);
    const sig = signer.sign(message);
    return [sig, message];
}

export const verifySignature = (
    api: ApiPromise,
    address: string,
    channelIdBytes: Uint8Array,
    version: number,
    counter: number,
    signature: Uint8Array
) => {
    const publicKey = decodeAddress(address);
    const hexPublicKey = u8aToHex(publicKey);
    const message = buildMessage(api, channelIdBytes, version, counter);
    return signatureVerify(message, signature, hexPublicKey).isValid;
}

export const readJSON = async (fileName: string) => {
    try {
        const j = await promisify(fs.readFile)(fileName);
        return JSON.parse(j.toString());
    } catch {}
}

export const writeJSON = async (fileName: string, data: any) => {
    const parentDir = path.dirname(fileName);
    setupDirs(parentDir);
    await promisify(fs.writeFile)(fileName, JSON.stringify(data, null, 2));
}
