
# Payment Channels - Simple Http Service

## Setup

### Running Substrate Node
```bash
./target/release/node-template --dev
```

### Remove files from previous runs (if necessary)
```bash
rm -rf /tmp/paymentChannels/
```

### Running the Calculator HTTP Service (should NOT be externally available)
```bash
npm run calculator

>>
[nodemon] starting `ts-node src/calculator.ts`
[INFO] Listening at http://0.0.0.0:3030
```

### Running the Paywall Service (should be externally available)
```bash
npm run paywall

>>
[nodemon] starting `ts-node src/paywall.ts`
Unable to map [u8; 32] to a lookup index
2023-12-12 20:14:14        API/INIT: node-template/100: Not decorating unknown runtime apis: 0xfbc577b9d747efd6/1
[INFO] Listening at http://0.0.0.0:3000
```

### Setup Alice's Organization, Service and Bob's channel
```bash
npm run setup
```

### Getting Signatures
```bash
npm run debug //Bob 1
npm run debug //Bob 2
npm run debug //Bob 3
...
npm run debug //Bob 100
```

### Sending requests to the Paywall Service with the extra fields (accountId, channelId, counter, signature)
```bash
curl -X POST "http://0.0.0.0:3000/mul" \
    -H "Content-Type: application/json" \
    -d '{"a": "1", "b": "2", "accountId": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty", "channelId": "0xb544d9268388acf6b3f821fb92e3d5d274551056f4af8969b47ea3cdcaaf8c4c", "counter": "1", "signature": "0xb0d3b060b76b8630feb553eee1ec2b273bf38ac9d56ff1e0de2992b904f73a351d0d55c98ee57d72d10967faecf5b7266ed5513c0bded9782f79f1fcab5cf885"}'

curl -X POST "http://0.0.0.0:3000/mul" \
    -H "Content-Type: application/json" \
    -d '{"a": "3", "b": "4", "accountId": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty", "channelId": "0xb544d9268388acf6b3f821fb92e3d5d274551056f4af8969b47ea3cdcaaf8c4c", "counter": "2", "signature": "0xfa96279f1ccd6f2983d70a9a4b0a3c33510ed7f1fa4d5cd4526f10ab34a73745d81952a8ce9cebdceff051eba639a9743e56e1c3b46bd2fef490516b181ad283"}'

curl -X POST "http://0.0.0.0:3000/mul" \
    -H "Content-Type: application/json" \
    -d '{"a": "5", "b": "6", "accountId": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty", "channelId": "0xb544d9268388acf6b3f821fb92e3d5d274551056f4af8969b47ea3cdcaaf8c4c", "counter": "3", "signature": "0xd4654e63b9dc447600548dc39b5f68779da54e8debafa0efb5052374cd18050e0d1c564d162372b8eb7660c1148de97f9b2cca54412b01c73cfbd1b5f11c2482"}'

curl -X POST "http://0.0.0.0:3000/mul" \
    -H "Content-Type: application/json" \
    -d '{"a": "100", "b": "100", "accountId": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty", "channelId": "0xb544d9268388acf6b3f821fb92e3d5d274551056f4af8969b47ea3cdcaaf8c4c", "counter": "100", "signature": "0xe6f5e1de290b488a8b1b6a93a5f67292102168060ed41d7e922d2e3080499b096dae171146cd9b95ff77fba3fe7c392b2eaffb9d090d158e0c7ac25ba4ae0e85"}'
```

### Paywall Service will keep track of latest counter/signatures
```bash
➜  simple-http-service git:(main) cat /tmp/paymentChannels/paywall/5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty/0xb544d9268388acf6b3f821fb92e3d5d274551056f4af8969b47ea3cdcaaf8c4c.json  
{
  "id": "0xb544d9268388acf6b3f821fb92e3d5d274551056f4af8969b47ea3cdcaaf8c4c",
  "organization": "0x14defea6f8a3e4f641e80c43d62b81825e0388ed0b72c1a049a31babb6f493af",
  "service": "0xa5309aeb197bd0f5ddc06af2888f06cf3ed1d384bc1f9281f9b45a6d76f29936",
  "owner": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
  "counter": "3",
  "price": 1000000000000,
  "calls": 100,
  "expiration": 117,
  "signature": "0xd4654e63b9dc447600548dc39b5f68779da54e8debafa0efb5052374cd18050e0d1c564d162372b8eb7660c1148de97f9b2cca54412b01c73cfbd1b5f11c2482"
}

➜  simple-http-service git:(main) cat /tmp/paymentChannels/paywall/5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty/0xb544d9268388acf6b3f821fb92e3d5d274551056f4af8969b47ea3cdcaaf8c4c/3.json 
{
  "accountId": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
  "channelId": "0xb544d9268388acf6b3f821fb92e3d5d274551056f4af8969b47ea3cdcaaf8c4c",
  "counter": "3",
  "signature": "0xd4654e63b9dc447600548dc39b5f68779da54e8debafa0efb5052374cd18050e0d1c564d162372b8eb7660c1148de97f9b2cca54412b01c73cfbd1b5f11c2482"
}
```
