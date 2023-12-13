
# Payment Channels - Simple Http Service

## Setup

```bash
git clone https://github.com/03303/simple-http-service.git

cd simple-http-service

npm i
```

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
# npm run debug <URI> <SERVICE_VERSION> <COUNTER>
npm run debug //Bob 1 1
npm run debug //Bob 1 2
npm run debug //Bob 1 3
...
npm run debug //Bob 1 100
```

### Sending requests to the Paywall Service with the extra fields (accountId, channelId, counter, signature)
```bash
curl -X POST "http://0.0.0.0:3000/mul" \
    -H "Content-Type: application/json" \
    -d '{"a": "1", "b": "2", "accountId": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty", "channelId": "0xb544d9268388acf6b3f821fb92e3d5d274551056f4af8969b47ea3cdcaaf8c4c", "counter": 1, "signature": "0x209cdf0c614c56a4b09d4dce13dbc8eae29d5c54542d7ff4fb63ebef7b75503cea5d9ce5c431b48d601e7061d6218716517d22e353703a2b6ef54f48bf37f780"}'

curl -X POST "http://0.0.0.0:3000/mul" \
    -H "Content-Type: application/json" \
    -d '{"a": "3", "b": "4", "accountId": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty", "channelId": "0xb544d9268388acf6b3f821fb92e3d5d274551056f4af8969b47ea3cdcaaf8c4c", "counter": 2, "signature": "0x20083c8de66c64cf9d90c1e23070e780ee8b851628ce118bf70226bd35bf0410255d39276bc5c9e5f6ea6b375109e2f970b2c28fd6fc66de1a97b6a5ae37158e"}'

curl -X POST "http://0.0.0.0:3000/mul" \
    -H "Content-Type: application/json" \
    -d '{"a": "5", "b": "6", "accountId": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty", "channelId": "0xb544d9268388acf6b3f821fb92e3d5d274551056f4af8969b47ea3cdcaaf8c4c", "counter": 3, "signature": "0x720344f2839ee5bb1ada29e6b77f6aba488834db96b4dfc1368ff6a179dc2d26f79bcf971f97ad7eadd0dd5492b7003600bf4edd8b9219d32a7dc19952c51184"}'

curl -X POST "http://0.0.0.0:3000/mul" \
    -H "Content-Type: application/json" \
    -d '{"a": "100", "b": "100", "accountId": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty", "channelId": "0xb544d9268388acf6b3f821fb92e3d5d274551056f4af8969b47ea3cdcaaf8c4c", "counter": 100, "signature": "0x80238c19a7793fe6f2c54f52d9eba5b689352f494409ed7cd220cbb3dac3c165b08544a7b8424e74560926dd4e9f7dc3682e9e8504ce294a67b00afaea382982"}'
```

### Paywall Service will keep track of latest counter/signatures
```bash
➜  simple-http-service git:(main) cat /tmp/paymentChannels/paywall/5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty/0xb544d9268388acf6b3f821fb92e3d5d274551056f4af8969b47ea3cdcaaf8c4c.json  
{
  "id": "0xb544d9268388acf6b3f821fb92e3d5d274551056f4af8969b47ea3cdcaaf8c4c",
  "organization": "0x14defea6f8a3e4f641e80c43d62b81825e0388ed0b72c1a049a31babb6f493af",
  "service": "0xa5309aeb197bd0f5ddc06af2888f06cf3ed1d384bc1f9281f9b45a6d76f29936",
  "version": 1,
  "owner": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
  "counter": 3,
  "price": 1000000000000,
  "calls": 100,
  "expiration": 137,
  "signature": "0x720344f2839ee5bb1ada29e6b77f6aba488834db96b4dfc1368ff6a179dc2d26f79bcf971f97ad7eadd0dd5492b7003600bf4edd8b9219d32a7dc19952c51184"
}

➜  simple-http-service git:(main) cat /tmp/paymentChannels/paywall/5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty/0xb544d9268388acf6b3f821fb92e3d5d274551056f4af8969b47ea3cdcaaf8c4c/3.json 
{
  "accountId": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
  "channelId": "0xb544d9268388acf6b3f821fb92e3d5d274551056f4af8969b47ea3cdcaaf8c4c",
  "version": 1,
  "counter": 3,
  "signature": "0x720344f2839ee5bb1ada29e6b77f6aba488834db96b4dfc1368ff6a179dc2d26f79bcf971f97ad7eadd0dd5492b7003600bf4edd8b9219d32a7dc19952c51184"
}
```
