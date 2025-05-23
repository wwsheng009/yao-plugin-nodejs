import { v4 } from "uuid";
import path from "path";
import fs from "fs";
import { toChunks } from "./helpers";

class NativeEmbedder {
    #fallbackHost = "https://cdn.anythingllm.com/support/models/";
    model: string;
    cacheDir: string;
    modelPath: string;
    modelDownloaded: boolean;
    maxConcurrentChunks: number;
    embeddingMaxChunkLength: number;

    constructor() {
        this.model = "Xenova/all-MiniLM-L6-v2";
        this.cacheDir = path.resolve(
            process.env.STORAGE_DIR
                ? path.resolve(process.env.STORAGE_DIR, `models`)
                : path.resolve(__dirname, `./models`)
        );
        this.modelPath = path.resolve(this.cacheDir, "Xenova", "all-MiniLM-L6-v2");
        this.modelDownloaded = fs.existsSync(this.modelPath);
        this.maxConcurrentChunks = 25;
        this.embeddingMaxChunkLength = 1_000;
        if (!fs.existsSync(this.cacheDir)) fs.mkdirSync(this.cacheDir);
        this.log("Initialized");
    }

    log(text: string, ...args: any[]): void {
        console.log(`\x1b[36m[NativeEmbedder]\x1b[0m ${text}`, ...args);
    }

    #tempfilePath(): string {
        const filename = `${v4()}.tmp`;
        const tmpPath = process.env.STORAGE_DIR
            ? path.resolve(process.env.STORAGE_DIR, "tmp")
            : path.resolve(__dirname, `./tmp`);
        if (!fs.existsSync(tmpPath)) fs.mkdirSync(tmpPath, { recursive: true });
        return path.resolve(tmpPath, filename);
    }

    async #writeToTempfile(filePath: string, data: string): Promise<void> {
        try {
            await fs.promises.appendFile(filePath, data, { encoding: "utf8" });
        } catch (e) {
            console.error(`Error writing to tempfile: ${e}`);
        }
    }

    async #fetchWithHost(hostOverride: string | null = null): Promise<any> {
        try {
            const pipeline = (...args: any[]) =>
                import("@xenova/transformers").then(({ pipeline, env }) => {
                    if (!this.modelDownloaded) {
                        if (hostOverride) {
                            env.remoteHost = hostOverride;
                            env.remotePathTemplate = "{model}/";
                        }
                        this.log(`Downloading ${this.model} from ${env.remoteHost}`);
                    }
                    return pipeline(...(args as [any, any, any]));
                });
            return {
                pipeline: await pipeline("feature-extraction", this.model, {
                    cache_dir: this.cacheDir,
                    ...(!this.modelDownloaded
                        ? {
                            progress_callback: (data: any) => {
                                if (!data.hasOwnProperty("progress")) return;
                                console.log(
                                    `\x1b[36m[NativeEmbedder - Downloading model]\x1b[0m ${data.file
                                    } ${~~data?.progress}%`
                                );
                            },
                        }
                        : {}),
                }),
                retry: false,
                error: null,
            };
        } catch (error) {
            return {
                pipeline: null,
                retry: hostOverride === null ? this.#fallbackHost : false,
                error,
            };
        }
    }

    async embedderClient(): Promise<any> {
        if (!this.modelDownloaded)
            this.log(
                "The native embedding model has never been run and will be downloaded right now. Subsequent runs will be faster. (~23MB)"
            );

        let fetchResponse = await this.#fetchWithHost();
        if (fetchResponse.pipeline !== null) {
            this.modelDownloaded = true;
            return fetchResponse.pipeline;
        }

        this.log(
            `Failed to download model from primary URL. Using fallback ${fetchResponse.retry}`
        );
        if (!!fetchResponse.retry)
            fetchResponse = await this.#fetchWithHost(fetchResponse.retry);
        if (fetchResponse.pipeline !== null) {
            this.modelDownloaded = true;
            return fetchResponse.pipeline;
        }

        throw fetchResponse.error;
    }

    async embedTextInput(textInput: string | string[]): Promise<any> {
        const result = await this.embedChunks(
            Array.isArray(textInput) ? textInput : [textInput]
        );
        return result?.[0] || [];
    }

    async embedChunks(textChunks: string[] = []): Promise<any> {
        const tmpFilePath = this.#tempfilePath();
        const chunks = toChunks(textChunks, this.maxConcurrentChunks);
        const chunkLen = chunks.length;

        for (let [idx, chunk] of chunks.entries()) {
            if (idx === 0) await this.#writeToTempfile(tmpFilePath, "[");
            let data;
            let pipeline = await this.embedderClient();
            let output = await pipeline(chunk, {
                pooling: "mean",
                normalize: true,
            });

            if (output.length === 0) {
                pipeline = null;
                output = null;
                data = null;
                continue;
            }

            data = JSON.stringify(output.tolist());
            await this.#writeToTempfile(tmpFilePath, data);
            this.log(`Embedded Chunk ${idx + 1} of ${chunkLen}`);
            if (chunkLen - 1 !== idx) await this.#writeToTempfile(tmpFilePath, ",");
            if (chunkLen - 1 === idx) await this.#writeToTempfile(tmpFilePath, "]");
            pipeline = null;
            output = null;
            data = null;
        }

        const embeddingResults = JSON.parse(
            fs.readFileSync(tmpFilePath, { encoding: "utf-8" })
        );
        fs.rmSync(tmpFilePath, { force: true });
        return embeddingResults.length > 0 ? embeddingResults.flat() : null;
    }
}

export {
    NativeEmbedder,
}; 