import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { ROOT_DIR, hashChannelId, readJSON, signChannelCounter, verifySignature } from "../common";
import { hexToU8a, u8aToHex } from '@polkadot/util';

const main = async () => {
    const keyring = new Keyring({ type: 'sr25519', ss58Format: 42 });
    await cryptoWaitReady();

    const uri = process.argv[2] || '//Bob';
    const signer = keyring.addFromUri(uri);

    const api = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:9944') });

    const { owner: serviceOwner, organization: organizationId, id: serviceId } = await readJSON(`${ROOT_DIR}/service.json`);
    const channelId = hashChannelId(signer.address, hexToU8a(organizationId), hexToU8a(serviceId));

    const counter = parseInt(process.argv[3] || "1");
    const [signature, message] = signChannelCounter(api, signer, channelId, counter);

    console.log(`Signer   : ${signer.address}`);
    console.log(`ChannelId: ${u8aToHex(channelId)}`);
    console.log(`Counter  : ${counter}`);
    console.log(`Message  : ${u8aToHex(message)}`);
    console.log(`Signature: ${u8aToHex(signature)}`);

    console.log(`Valid: ${verifySignature(api, signer.address, channelId, counter, signature)}`);
};

main().catch((error) => {
    console.error(`[ERROR] ${error.message}`);
    process.exit(1);
}).then(() => process.exit(0));
