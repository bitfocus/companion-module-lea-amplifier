//LEA Amplifier

const { InstanceBase, InstanceStatus, runEntrypoint } = require('@companion-module/base')
const UpgradeScripts = require('./src/upgrades')

const config = require('./src/config')
const actions = require('./src/actions')
const feedbacks = require('./src/feedbacks')
const variables = require('./src/variables')
const presets = require('./src/presets')

const utils = require('./src/utils')

class leaAmpInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		// Assign the methods from the listed files to this class
		Object.assign(this, {
			...config,
			...actions,
			...feedbacks,
			...variables,
			...presets,
			...utils,
		})

		this.ws = null;

		this.LEA_API = '1.0';
		this.LEA_ID = 1;
		
		this.INPUT_CHANNELS = [
			{id: '1', label: 'Input Channel 1'}
		]
		
		this.INPUT_CHANNELS_SECONDARY = [
			{id: '1', label: 'Input Channel 1'},
			{id: 'none', label: 'None'}
		]
		
		this.OUTPUT_CHANNELS = [
			{id: '1', label: 'Output Channel 1'}
		]
		
		this.initialData = null; //used for top level data like amp name etc.
		this.inputs = null;
		this.ampData = null; //used for feedbacks and variables
	}

	async destroy() {
		
	}

	async init(config) {
		this.configUpdated(config)
	}

	async configUpdated(config) {
		this.config = config

		this.updateStatus(InstanceStatus.Connecting);
		
		this.initActions()
		this.initFeedbacks()
		this.initVariables()
		this.initPresets()

		this.initWebSocket();
	}
}

runEntrypoint(leaAmpInstance, UpgradeScripts)