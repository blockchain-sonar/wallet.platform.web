import { ConsoleLogger, DummyLogger, Logger } from "./Logger";

type UnderlayingTONClient = any;

const TONClient: UnderlayingTONClient = require("ton-client-web-js").TONClient;

export interface AccountInfo {
	readonly balance: string;
	readonly codeHash: string;
}

export interface KeyPair {
	readonly public: string;
	readonly secret: string;
}

export interface Fees {
	readonly gasFee: string;
	readonly inMsgFwdFee: string;
	readonly outMsgsFwdFee: string;
	readonly storageFee: string;
	readonly totalAccountFees: string;
	readonly totalOutput: string;
}

export interface RunMessage {

}

export interface Transaction {
	readonly fees: any;
	readonly output: any;
	readonly transaction: any;
}


export class TonClientFacadeError extends Error {
	public readonly innerException: any;
	constructor(msg: string, innerException: any = undefined) {
		super(msg);
		this.innerException = innerException;
	}
}

export namespace TONClientFacade {
	export interface Opts {
		readonly servers: ReadonlyArray<string>; // like: ['net.ton.dev']
		readonly logger?: Logger | string;
	}

	export interface Constructor {
		new(opts: Opts): TONClientFacade;
	}
}

export class TONClientFacade {
	private readonly _logger: Logger;
	private readonly _server: ReadonlyArray<string>;
	private __tonClientInitializer: null | Promise<UnderlayingTONClient> | UnderlayingTONClient;

	public constructor(opts: TONClientFacade.Opts) {
		this.__tonClientInitializer = null;

		if (opts.logger === undefined) {
			this._logger = new DummyLogger();
		} else {
			if (typeof opts.logger === "string") {
				if (opts.logger === "console") {
					this._logger = new ConsoleLogger();
				} else {
					this._logger = new DummyLogger();
				}
			} else {
				this._logger = opts.logger;
			}
		}

		this._server = Object.freeze([...opts.servers]);
		this._logger.info("An instance of TONClientFacade was constructed.");
	}

	async init() {
		if (this.__tonClientInitializer === null) {
			this._logger.trace(`TON Client initializing for servers: ${this._server.join(", ")}`);
			this._logger.debug("TON Client initializing...");
			this.__tonClientInitializer = TONClientFacade._createTONClient(this._server);
		}
		if (this.__tonClientInitializer instanceof Promise) {
			await this.__tonClientInitializer
				.then(tonClient => {
					this.__tonClientInitializer = tonClient;
					this._logger.info("TON Client was initialized successfully.");
				});
		}
	}

	async calcDeployFees(
		keyPublic: string,
		keySecret: string,
		smartContractABI: string,
		smartContractTVCBase64: string
	): Promise<Fees> {
		const friendlySmartContractABI: any = JSON.parse(smartContractABI);
		const pkg = Object.freeze({
			abi: friendlySmartContractABI,
			imageBase64: smartContractTVCBase64
		});
		const constructorParams = Object.freeze({ owners: [`0x${keyPublic}`], reqConfirms: 1 });
		const param = Object.freeze({
			package: pkg,
			constructorParams,
			// initParams: {},
			keyPair: Object.freeze({
				"public": keyPublic,
				"secret": keySecret
			}),
			emulateBalance: true,
			newaccount: true
		});
		try {
			const result: any = await this._tonClient.contracts.calcDeployFees(param);

			const fees: Fees = result.fees;

			return fees;
		} catch (e) {
			this._logger.error("Failure calcDeployFees.", e);
			throw e;
		}
	}

	async createRunMessage(
		keyPublic: string,
		keySecret: string,
		accountAddress: string,
		smartContractABI: string,
		methodName: string,
		args: string
	): Promise<string> {
		const friendlySmartContractABI: any = JSON.parse(smartContractABI);
		const friendlyArgs: any = JSON.parse(args);

		const keyPair = Object.freeze({
			"public": keyPublic,
			"secret": keySecret
		});

		try {
			const runMessage = await this._tonClient.contracts.createRunMessage(
				Object.freeze({
					address: accountAddress,
					abi: friendlySmartContractABI,
					functionName: methodName,
					input: friendlyArgs,
					keyPair: keyPair
				})
			);
			const runMessageJson = JSON.stringify(runMessage);
			return runMessageJson;
		} catch (e) {
			this._logger.error("Failure createRunMessage.", e);
			throw e;
		}
	}

	/**
	 * @param hdpath like "m/44'/396'/0'/0/0". See https://docs.freeton-wallet.org/glossary/#hdpath
	 */
	async deriveKeyPair(seedMnemonicWords: Array<string>, hdpath: string) {
		try {
			const SEED_PHRASE_DICTIONARY_ENGLISH: number = 1;
			const keyPair: KeyPair = await this._tonClient.crypto.mnemonicDeriveSignKeys({
				dictionary: SEED_PHRASE_DICTIONARY_ENGLISH,
				wordCount: seedMnemonicWords.length,
				phrase: seedMnemonicWords.join(" "),
				path: hdpath
			});
			return keyPair;
		} catch (e) {
			this._logger.error("Failure deriveKeyPair.", e);
			throw e;
		}
	}

	async deployContract(
		keyPublic: string,
		keySecret: string,
		smartContractABI: string,
		smartContractTVCBase64: string
	): Promise<void> {
		const friendlySmartContractABI: any = JSON.parse(smartContractABI);
		const pkg = Object.freeze({
			abi: friendlySmartContractABI,
			imageBase64: smartContractTVCBase64
		});
		const constructorParams = Object.freeze({ owners: [`0x${keyPublic}`], reqConfirms: 1 });
		const param = Object.freeze({
			package: pkg,
			constructorParams,
			// initParams: {},
			keyPair: Object.freeze({
				"public": keyPublic,
				"secret": keySecret
			})
		});

		try {
			const deployMessage = await this._tonClient.contracts.createDeployMessage(param);

			const processingState = await this._tonClient.contracts.sendMessage(deployMessage.message);

			const waitResult = await this._tonClient.contracts.waitForDeployTransaction(deployMessage, processingState);
		} catch (e) {
			this._logger.error("Failure deployContract.", e);
			throw e;
		}
	}

	async generateMnemonicPhraseSeed(wordsCount: number): Promise<Array<string>> {
		try {
			const SEED_PHRASE_DICTIONARY_ENGLISH: number = 1;
			const seed: string = await this._tonClient.crypto.mnemonicFromRandom({
				dictionary: SEED_PHRASE_DICTIONARY_ENGLISH,
				wordCount: wordsCount
			});
			//this._logger.trace(`Generated seed is: ${seed}`);
			const words: Array<string> = seed.split(" ");
			return words;
		} catch (e) {
			this._logger.error("Failure generateMnemonicPhraseSeed.", e);
			throw e;
		}
	}

	async getDeployData(
		keyPublic: string,
		smartContractABI: string,
		smartContractTVCBase64: string
	): Promise<string> {

		const friendlySmartContractABI: any = JSON.parse(smartContractABI);

		const param = {
			abi: friendlySmartContractABI,
			imageBase64: smartContractTVCBase64,
			// initParams: {},
			publicKeyHex: keyPublic,
			workchainId: 0,
		};
		try {
			const result: UnderlayingTONClient.DeployData = await this._tonClient.contracts.getDeployData(param);
			return result.address;
		} catch (e) {
			this._logger.error("Failure getDeployData.", e);
			throw e;
		}
	}

	async fetchAccountInformation(address: string): Promise<AccountInfo | null> {
		try {
			const data = await this._tonClient.queries.accounts
				.query({ id: { in: address } }, 'id, balance(format: DEC), code_hash');

			if (!Array.isArray(data) || data.length === 0) {
				return null;
			}

			const balance: string = data[0].balance;
			const code_hash: string = data[0].code_hash;

			const result: AccountInfo = {
				balance,
				codeHash: code_hash
			};

			return Object.freeze(result);
		} catch (e) {
			this._logger.error("Failure fetchAccountInformation.", e);
			throw e;
		}
	}

	async sendMessage(messageSendToken: string): Promise<string> {
		const runMessage: any = JSON.parse(messageSendToken);

		try {
			const processingState = await this._tonClient.contracts.sendMessage(runMessage.message);
			const processingStateJson = JSON.stringify(processingState);
			return processingStateJson;
		} catch (e) {
			this._logger.error("Failure sendMessage.", e);
			throw e;
		}
	}

	async waitForRunTransaction(messageSendToken: string, processingStateToken: string): Promise<Transaction> {
		const runMessage: any = JSON.parse(messageSendToken);
		const processingState: any = JSON.parse(processingStateToken);

		try {
			const transation: Transaction = await this._tonClient.contracts.waitForRunTransaction(runMessage, processingState);
			return transation;
		} catch (e) {
			this._logger.error("Failure waitForRunTransaction.", e);
			throw e;
		}
	}

	get _tonClient(): Promise<UnderlayingTONClient> | UnderlayingTONClient {
		if (this.__tonClientInitializer === null || this.__tonClientInitializer instanceof Promise) {
			throw new Error("Invalid operation. Did you init()?.")
		}
		return this.__tonClientInitializer;
	}

	static async _createTONClient(servers: ReadonlyArray<string>) {
		return await TONClient.create({
			servers: [...servers] // clone
		});
	}
}

namespace UnderlayingTONClient {
	export interface DeployData {
		readonly accountId: string;
		readonly address: string;
		readonly dataBase64: string;
		readonly imageBase64: string;
	}
}