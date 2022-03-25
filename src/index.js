var instance_skel = require('../../../instance_skel')

const WebSocket = require('ws');

var actions = require('./actions.js')
var feedbacks = require('./feedbacks.js')
var variables = require('./variables.js')
var presets = require('./presets.js');
const { sortedLastIndexOf } = require('lodash');

var debug

instance.prototype.ws = null;

instance.prototype.LEA_API = '1.0';
instance.prototype.LEA_ID = 1;

instance.prototype.INPUT_CHANNELS = [
	{id: '1', label: 'Input Channel 1'}
]

instance.prototype.INPUT_CHANNELS_SECONDARY = [
	{id: '1', label: 'Input Channel 1'},
	{id: 'none', label: 'None'}
]

instance.prototype.OUTPUT_CHANNELS = [
	{id: '1', label: 'Output Channel 1'}
]

instance.prototype.initialData = null; //used for top level data like amp name etc.
instance.prototype.inputs = null;
instance.prototype.ampData = null; //used for feedbacks and variables

// ########################
// #### Instance setup ####
// ########################
function instance(system, id, config) {
	var self = this

	// super-constructor
	instance_skel.apply(this, arguments)

	return self
}

instance.GetUpgradeScripts = function () {
}

// When module gets deleted
instance.prototype.destroy = function () {
	var self = this;


	debug('destroy', self.id)
}

// Initalize module
instance.prototype.init = function () {
	var self = this

	debug = self.debug
	log = self.log

	self.data = {};

	self.status(self.STATUS_WARNING, 'connecting')
	self.init_websocket();

	self.init_actions();
	self.init_feedbacks();
	self.init_variables();
	self.init_presets();
}

// Update module after a config change
instance.prototype.updateConfig = function (config) {
	var self = this
	self.config = config

	self.status(self.STATUS_WARNING, 'connecting')
	self.init_websocket();

	self.init_actions();
	self.init_feedbacks();
	self.init_variables();
	self.init_presets();
}

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this

	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'This module controls LEA Amplifiers',
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'IP',
			width: 4,
			regex: self.REGEX_IP
		},
		{
			type: 'text',
			id: 'dummy1',
			width: 12,
			label: ' ',
			value: ' ',
		},
		{
			type: 'checkbox',
			id: 'debug',
			width: 1,
			label: 'Enable',
			default: false,
		},
		{
			type: 'text',
			id: 'debugInfo',
			width: 11,
			label: 'Enable Debug To Log Window',
			value: 'Requires Companion to be restarted. But this will allow you the see what is being sent from the module and what is being received from the device.',
		},
	]
}

instance.prototype.init_websocket = function() {
	let self = this;

	let ip = self.config.host;
	let port = 1234;

	if (self.ws !== null) {
		self.ws.close(1000)
		delete self.ws
	}

	self.ws = new WebSocket(`ws://${ip}:${port}`)

	self.ws.on('open', () => {
		self.log('debug', `Connection opened`)
		self.status(this.STATUS_OK)

		let obj = {};
		obj.leaApi = self.LEA_API;
		obj.url = '/amp/channels';
		obj.method = 'subscribe';
		obj.params = {}
		obj.id = self.LEA_ID;

		self.ws.send(Buffer.from(JSON.stringify(obj)));

		//get initial top-level data
		obj.url = '/';
		obj.method = 'get';
		self.ws.send(Buffer.from(JSON.stringify(obj)));

	})

	self.ws.on('close', (code) => {
		self.log('debug', `Websocket connection closed with code ${code}`);
	})

	self.ws.on('message', (data) => {
		self.updateData(data);
	});

	self.ws.on('error', (error) => {
		self.handleError(error);
	})
}

instance.prototype.updateData = function (data) {
	let self = this

	let objData = null;

	if (self.config.debug == true) {
		debug(data);
		self.log('debug', data);
	}

	try {
		objData = JSON.parse(data);
	}
	catch(error) {
		self.log('error', 'Error parsing response: ' + String(error))
	}

	try {
		if (objData) {
			if (objData.result) { //initial result, so build channel list and rebuild feedbacks, variables, and presets
				if (objData.url === '/') {
					self.processInitialData(objData);
				}
				else if (objData.url === '/amp/channels') {
					self.ampData = objData.result;
					self.buildOutputChannelList();
				}

				self.init_actions();
				self.init_feedbacks();
				self.init_variables();
				self.init_presets();
			}
			else if (objData.method == 'notify') {
				if (objData.params.amp.channels) {
					self.updateChannelData(objData.params.amp.channels);
				}
			}
		}

		self.checkFeedbacks();
		self.checkVariables();
	}
	catch(error) {
		console.log(error);
		self.log('error', 'Error handling data response: ' + String(error))
	}
};

instance.prototype.processInitialData = function(data) {
	let self = this;

	try {
		self.initialData = {};
		self.initialData.deviceName = data.result.amp.deviceInfo.deviceName;
		self.initialData.venueName = data.result.amp.deviceInfo.venueName;
		self.initialData.modelID = data.result.amp.deviceInfo.modelID;
		self.initialData.serialNumber = data.result.amp.deviceInfo.serialNumber;
		self.initialData.firmwareVersion = data.result.amp.deviceInfo.firmwareVersion;

		self.buildInputChannelList(data.result.amp.inputs);
	}
	catch(error) {
		console.log(error);
		self.log('error', 'Error processing initial data: ' + String(error))
	}	
}

instance.prototype.buildInputChannelList = function(data) {
	let self = this;

	self.INPUT_CHANNELS = [];
	self.INPUT_CHANNELS_SECONDARY = [];
	self.inputs = [];

	if (data.dante) {
		let objKeys = Object.keys(data.dante);

		for (let i = 0; i < objKeys.length; i++) {
			let inputNumber = objKeys[i].toString();
			let inputName = 'Dante ' + objKeys[i];

			let inputChannelObj = {
				id: inputNumber,
				label: inputName
			};

			self.INPUT_CHANNELS.push(inputChannelObj);

			let inputObj = {
				id: inputNumber,
				label: data.dante[objKeys[i]].name,
				type: 'Dante'
			}

			self.inputs.push(inputObj);

			if (parseInt(inputNumber) % 2 === 0) {
				//even number, so create the stereo channel with the previous channel
				inputNumber = objKeys[i-1] + '_' + objKeys[i];
				inputName = 'Dante ' + objKeys[i-1] + '+' + objKeys[i];

				inputChannelObj = {
					id: inputNumber,
					label: inputName,
				}

				self.INPUT_CHANNELS.push(inputChannelObj);
			}
		}		
	}

	if (data.analog) {
		let objKeys = Object.keys(data.analog);

		for (let i = 0; i < objKeys.length; i++) {
			let inputNumber = objKeys[i].toString();
			let inputName = 'Analog ' + objKeys[i];

			let inputChannelObj = {
				id: inputNumber,
				label: inputName
			};

			self.INPUT_CHANNELS.push(inputChannelObj);

			let inputObj = {
				id: inputNumber,
				label: data.analog[objKeys[i]].name,
				type: 'Analog'
			}

			self.inputs.push(inputObj);

			if (parseInt(inputNumber) % 2 === 0) {
				//even number, so create the stereo channel with the previous channel
				inputNumber = objKeys[i-1] + '_' + objKeys[i];
				inputName = 'Analog ' + objKeys[i-1] + '+' + objKeys[i];

				inputChannelObj = {
					id: inputNumber,
					label: inputName
				}

				self.INPUT_CHANNELS.push(inputChannelObj);
			}
		}	
	}

	self.INPUT_CHANNELS_SECONDARY = self.INPUT_CHANNELS;
	let noneChannelObj = {
		id: 'none',
		label: 'None'
	}
	self.INPUT_CHANNELS_SECONDARY.push(noneChannelObj);
}

instance.prototype.buildOutputChannelList = function() {
	let self = this;

	if (self.ampData) {
		self.OUTPUT_CHANNELS = [];
		//loop through all these and build the list of channels

		let objKeys = Object.keys(self.ampData);

		for (let i = 0; i < objKeys.length; i++) {
			let outputNumber = objKeys[i].toString();
			let outputName = 'Output ' + objKeys[i] + ' - ' + self.ampData[objKeys[i]].output.name;

			let outputChannelObj = {
				id: outputNumber,
				label: outputName
			};

			self.OUTPUT_CHANNELS.push(outputChannelObj);
		}
	}
};

instance.prototype.updateChannelData = function(data) {
	let self = this;

	if (self.ampData) {
		let objKeys = Object.keys(self.ampData);
		let dataKeys = Object.keys(data);

		for (let i = 0; i < objKeys.length; i++) {
			let channelNumber = objKeys[i].toString();

			for (let j = 0; j < dataKeys.length; j++) {
				if (channelNumber == dataKeys[j].toString()) {
					//update in place
					self.ampData[objKeys[i]].inputSelector = {...self.ampData[objKeys[i]].inputSelector, ...data[dataKeys[j]].inputSelector};
					self.ampData[objKeys[i]].output = {...self.ampData[objKeys[i]].output, ...data[dataKeys[j]].output};
				}
			}
		}
	}
};

instance.prototype.handleError = function(err) {
	let self = this;

	let error = err.toString();
	let printedError = false;

	Object.keys(err).forEach(function(key) {
		if (key === 'code') {
			if (err[key] === 'ECONNREFUSED') {
				error = 'Unable to communicate with Device. Connection refused. Is this the right IP address? Is it still online?';
				self.log('error', error);
				self.status(self.STATUS_ERROR);
				printedError = true;
			}
		}
	});

	if (!printedError) {
		self.log('error', `Unhandled Error: ${error}`)
	}
};

// ##########################
// #### Instance Actions ####
// ##########################
instance.prototype.init_actions = function (system) {
	this.setActions(actions.setActions.bind(this)());
};

// ############################
// #### Instance Feedbacks ####
// ############################
instance.prototype.init_feedbacks = function (system) {
	this.setFeedbackDefinitions(feedbacks.setFeedbacks.bind(this)());
};

// ############################
// #### Instance Variables ####
// ############################
instance.prototype.init_variables = function () {
	this.setVariableDefinitions(variables.setVariables.bind(this)());
};

// Setup Initial Values
instance.prototype.checkVariables = function () {
	variables.checkVariables.bind(this)();
};

// ##########################
// #### Instance Presets ####
// ##########################
instance.prototype.init_presets = function () {
	this.setPresetDefinitions(presets.setPresets.bind(this)());
};

// ###########################
// #### Send JSON Command ####
// ###########################
instance.prototype.sendCommand = function(obj) {
	let self = this;

	self.ws.send(Buffer.from(JSON.stringify(obj)));
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;