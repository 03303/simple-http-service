import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import {
    hashName,
    writeJSON,
    setupDirs,
    ROOT_DIR,
    blockTracker,
    extrinsicsMap,
    getOrganizationsByOwner,
    getServicesByOrgId,
    getChannelsByOwner,
    hashChannelId
} from '../common';

import { u8aToHex } from '@polkadot/util';

const main = async () => {

    setupDirs();

    const keyring = new Keyring({ type: 'sr25519', ss58Format: 42 });
    await cryptoWaitReady();

    const alice = keyring.addFromUri('//Alice');
    const bob = keyring.addFromUri('//Bob');

    const api = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:9944') });

    await blockTracker(api);

    let aliceOrganizations: any[] = await getOrganizationsByOwner(api, alice.address);

    const orgName = "My Organization";
    const organizationId = hashName(api, alice.address, orgName);
    if (aliceOrganizations.length < 1) {
        // Alice creates an Organization
        const xtOrg = (await api.tx.paymentChannels.createOrganization(orgName, [], "").signAndSend(alice)).toString();
        aliceOrganizations.push({ id: organizationId });
        console.log(`[Organization] Created [xtHash: ${xtOrg}]`);
        while (!extrinsicsMap.get(xtOrg)) await new Promise(r => setTimeout(r, 100));
        aliceOrganizations = await getOrganizationsByOwner(api, alice.address);
    }

    let aliceOrgServices: any[] = await getServicesByOrgId(api, aliceOrganizations[0].id);

    // Alice creates a Service under her Organization
    const srvName = "My Service";
    if (aliceOrgServices.length < 1) {
        const xtSrv = (
            await api.tx.paymentChannels.createService(
                [alice.address, organizationId],
                srvName,
                1_000_000_000_000,
                50,
                100,
                3,
                "",
            )
            .signAndSend(alice)
        ).toString();
        console.log(`[Service] Created [xtHash: ${xtSrv}]`);
        while (!extrinsicsMap.get(xtSrv)) await new Promise(r => setTimeout(r, 100));
        aliceOrgServices = await getServicesByOrgId(api, aliceOrganizations[0].id);
    }
    const serviceId = hashName(api, alice.address, srvName);

    await writeJSON(`${ROOT_DIR}/service.json`, aliceOrgServices[0]);

    let bobChannels: any[] = await getChannelsByOwner(api, bob.address);

    // Bob opens a Channel to Alice's Service
    if (bobChannels.length < 1) {
        const xtChn = (
            await api.tx.paymentChannels.openChannel(
                [[alice.address, organizationId], serviceId],
                100,
            )
            .signAndSend(bob)
        ).toString();
        console.log(`[Channel] Created [xtHash: ${xtChn}]`);
        while (!extrinsicsMap.get(xtChn)) await new Promise(r => setTimeout(r, 100));
        bobChannels = await getChannelsByOwner(api, bob.address);
    }
    const channelId = hashChannelId(bob.address, organizationId, serviceId);

    await writeJSON(`${ROOT_DIR}/${bob.address}/${u8aToHex(channelId)}.json`, bobChannels[0]);

};

main().catch((error) => {
    console.error(`[ERROR] ${error.message}`);
    process.exit(1);
}).then(() => process.exit(0));
