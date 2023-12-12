import express, { Express, Request, Response } from "express";
import BodyParser from "body-parser";
import axios from "axios";

import { ApiPromise, WsProvider } from '@polkadot/api';
import { hexToU8a } from '@polkadot/util';
import { ROOT_DIR, getChannel, readJSON, setupDirs, verifySignature, writeJSON } from "./common";

const HOST = "0.0.0.0";
const PORT = 3000;
const SERVICE_ENDPOINT = "http://0.0.0.0:3030";

interface PaywallBody extends Request {
    a: number,
    b: number,
    accountId: string,
    channelId: string,
    counter: number,
    signature: string,
}

const main = async () => {

    const api = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:9944') });

    const app: Express = express();
    app.use(BodyParser.json());

    app.post("*", async (req: Request, res: Response) => {
        try {
            const body = req.body as PaywallBody;

            const channel = await getChannel(api, body.accountId, body.channelId);
            if (channel.id === "") throw Error('Channel not Found!');

            const blockNumber = (await api.rpc.chain.getHeader()!).number.toNumber(); 
            if (channel.expiration <= blockNumber) throw Error('Channel is Expired!');

            let localChannel = await readJSON(`${ROOT_DIR}/paywall/${body.accountId}/${body.channelId}.json`);
            if (!localChannel) localChannel = channel;

            if (parseInt(localChannel.counter) >= body.counter) throw Error(`Counter too Low (curr: ${localChannel.counter} >= ${body.counter})!`);

            const valid = verifySignature(api, body.accountId, hexToU8a(body.channelId), body.counter, hexToU8a(body.signature));

            localChannel = { ...localChannel, counter: body.counter, signature: body.signature };
            const localData = { accountId: body.accountId, channelId: body.channelId, counter: body.counter, signature: body.signature };

            if (valid) {
                const endpoint = req.url.replace(SERVICE_ENDPOINT, '');
                const r = await axios({
                    url: SERVICE_ENDPOINT + endpoint,
                    method: req.method,
                    data: req.body,
                    headers: { "content-type":"application/json" },
                });
                res.send(r.data);
                await writeJSON(`${ROOT_DIR}/paywall/${body.accountId}/${body.channelId}.json`, localChannel);
                await writeJSON(`${ROOT_DIR}/paywall/${body.accountId}/${body.channelId}/${body.counter}.json`, localData);
            } else throw Error("Invalid Signature!");

        } catch (error: any) {
            const msg = `[ERROR][/*] ${error.message}`;
            console.error(msg);
            res.status(500).send({ error: msg });
        }
    });

    app.listen(PORT, HOST, () => {
        console.log(`[INFO] Listening at http://${HOST}:${PORT}`);
    });
};

main().catch((error) => {
    console.error(`[ERROR] ${error.message}`);
    process.exit(1);
});
