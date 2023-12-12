import express, { Express, Request, Response } from "express";
import BodyParser from "body-parser";

// curl -X POST "http://0.0.0.0:3030/add" -H "Content-Type: application/json" -d '{"a": 7, "b": 9}'

const HOST = "0.0.0.0";
const PORT = 3030;

interface CalculatorBody extends Request {
    a: number,
    b: number,
}

const main = async () => {

    const app: Express = express();
    app.use(BodyParser.json());

    app.post("/add", async (req: Request, res: Response) => {
        try {
            const body = req.body as CalculatorBody;
            const result = body?.a + body?.b;
            res.send({ result });
        } catch (error: any) {
            const msg = `[ERROR][/add] ${error.message}`;
            console.error(msg);
            res.status(500).send({ error: msg });
        }
    });

    app.post("/sub", async (req: Request, res: Response) => {
        try {
            const body = req.body as CalculatorBody;
            const result = body?.a - body?.b;
            res.send({ result });
        } catch (error: any) {
            const msg = `[ERROR][/sub] ${error.message}`;
            console.error(msg);
            res.status(500).send({ error: msg });
        }
    });

    app.post("/div", async (req: Request, res: Response) => {
        try {
            const body = req.body as CalculatorBody;
            const result = body?.a / body?.b;
            res.send({ result });
        } catch (error: any) {
            const msg = `[ERROR][/div] ${error.message}`;
            console.error(msg);
            res.status(500).send({ error: msg });
        }
    });

    app.post("/mul", async (req: Request, res: Response) => {
        try {
            const body = req.body as CalculatorBody;
            const result = body?.a * body?.b;
            res.send({ result });
        } catch (error: any) {
            const msg = `[ERROR][/mul] ${error.message}`;
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
