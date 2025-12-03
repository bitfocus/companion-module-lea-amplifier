const { InstanceStatus } = require('@companion-module/base');
const WebSocket = require('ws');

module.exports = {
	initWebSocket: function() {
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
			self.updateStatus(InstanceStatus.Ok);
	
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
	},
	
	updateData: function (data) {
		let self = this
	
		let objData = null;
	
		if (self.config.debug == true) {
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
	
					self.initActions();
					self.initFeedbacks();
					self.initVariables();
					self.initPresets();
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
	},

	processInitialData: function(data) {
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
	},
	
	buildInputChannelList: function(data) {
		let self = this;
	
		self.INPUT_CHANNELS = [];
		self.INPUT_CHANNELS_SECONDARY = [];
		self.inputs = [];
	
		if (data.dante) {
			let objKeys = Object.keys(data.dante);
	
			for (let i = 0; i < objKeys.length; i++) {
				let inputNumber = "D" + objKeys[i].toString();
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
					inputNumber = "D" + objKeys[i-1] + '_' + objKeys[i];
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
	},
	
	buildOutputChannelList: function() {
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
	},
	
	updateChannelData: function(data) {
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
	},
	
	handleError: function(err) {
		let self = this;
	
		let error = err.toString();
		let printedError = false;
	
		Object.keys(err).forEach(function(key) {
			if (key === 'code') {
				if (err[key] === 'ECONNREFUSED') {
					error = 'Unable to communicate with Device. Connection refused. Is this the right IP address? Is it still online?';
					self.log('error', error);
					self.updateStatus(InstanceStatus.ConnectionFailure);
					printedError = true;
				}
			}
		});
	
		if (!printedError) {
			self.log('error', `Unhandled Error: ${error}`)
		}
	},

	sendCommand: function(obj) {
		let self = this;
	
		self.ws.send(Buffer.from(JSON.stringify(obj)));
	}
}