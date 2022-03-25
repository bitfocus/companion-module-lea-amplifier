module.exports = {
	// ##########################
	// #### Instance Actions ####
	// ##########################
	setActions: function () {
		let self = this
		let actions = {}

		actions.routePrimaryInputChannelToOutputChannel = {
			label: 'Route Primary Input Channel to Output Channel',
			options: [
				{
					type: 'dropdown',
					label: 'Input Channel',
					id: 'input_channel',
					default: self.INPUT_CHANNELS[0].id,
					choices: self.INPUT_CHANNELS
				},
				{
					type: 'dropdown',
					label: 'Output Channel',
					id: 'output_channel',
					default: self.OUTPUT_CHANNELS[0].id,
					choices: self.OUTPUT_CHANNELS
				}
			],
			callback: function (action, bank) {
				let opt = action.options;

				let channelName = self.INPUT_CHANNELS.find(CHANNEL => CHANNEL.id == opt.input_channel).label;

				let obj = {};
				obj.leaApi = self.LEA_API;
				obj.url = `/amp/channels/${opt.output_channel}/inputSelector`;
				obj.method = 'set';
				obj.params = {
					primary: channelName
				}
				obj.id = self.LEA_ID;

				self.sendCommand(obj);
			}
		}

		actions.routeSecondaryInputChannelToOutputChannel = {
			label: 'Route Secondary Input Channel to Output Channel',
			options: [
				{
					type: 'dropdown',
					label: 'Input Channel',
					id: 'input_channel',
					default: self.INPUT_CHANNELS_SECONDARY[0].id,
					choices: self.INPUT_CHANNELS_SECONDARY
				},
				{
					type: 'dropdown',
					label: 'Output Channel',
					id: 'output_channel',
					default: self.OUTPUT_CHANNELS[0].id,
					choices: self.OUTPUT_CHANNELS
				}
			],
			callback: function (action, bank) {
				let opt = action.options;

				let channelName = self.INPUT_CHANNELS_SECONDARY.find(CHANNEL => CHANNEL.id == opt.input_channel).label;

				let obj = {};
				obj.leaApi = self.LEA_API;
				obj.url = `/amp/channels/${opt.output_channel}/inputSelector`;
				obj.method = 'set';
				obj.params = {
					secondary: channelName
				}
				obj.id = self.LEA_ID;

				self.sendCommand(obj);
			}
		}

		actions.setOutputChannelVolumeValue = {
			label: 'Set Output Channel Volume to Value',
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: self.OUTPUT_CHANNELS[0].id,
					choices: self.OUTPUT_CHANNELS
				},
				{
					type: 'textinput',
					label: 'Value',
					id: 'value',
					default: '0.0',
				}
			],
			callback: function (action, bank) {
				let opt = action.options;

				let optValue = opt.value;
				self.parseVariables(optValue, function (value) {
					optValue = value;
				});

				let objChannel = null;
				
				if (self.ampData) {
					objChannel = self.ampData[opt.channel];
				}

				if (objChannel) {
					optValue = parseFloat(optValue);
					if (!Number.isNaN(optValue)) {
						let obj = {};
						obj.leaApi = self.LEA_API;
						obj.url = `/amp/channels/${opt.channel}/output`;
						obj.method = 'set';
						obj.params = {
							fader: optValue
						}
						obj.id = self.LEA_ID;
		
						self.sendCommand(obj);
					}
					else {
						//an invalid value was sent which is not a number
						self.log('error', 'Error setting Output Channel Value: Value passed is not a number.');
					}
				}
				else {
					//the channel selected was not found
					self.log('error', 'Error setting Output Channel Value: Channel not found.');
				}
			}
		}

		actions.setOutputChannelVolumeRelativeValue = {
			label: 'Set Output Channel Volume to Relative Value (+/-)',
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: self.OUTPUT_CHANNELS[0].id,
					choices: self.OUTPUT_CHANNELS
				},
				{
					type: 'textinput',
					label: 'Relative Value',
					id: 'value',
					default: '1.0',
				}
			],
			callback: function (action, bank) {
				let opt = action.options;

				let optValue = opt.value;
				self.parseVariables(optValue, function (value) {
					optValue = value;
				});

				let objChannel = null;
				
				if (self.ampData) {
					objChannel = self.ampData[opt.channel];
				}

				if (objChannel) {
					let faderLevel = objChannel.output.fader;

					optValue = parseFloat(optValue);
					if (!Number.isNaN(optValue)) {
						optValue = faderLevel + optValue; //add the relative value to the existing fader level to form the new value

						let obj = {};
						obj.leaApi = self.LEA_API;
						obj.url = `/amp/channels/${opt.channel}/output`;
						obj.method = 'set';
						obj.params = {
							fader: optValue
						}
						obj.id = self.LEA_ID;
		
						self.sendCommand(obj);
					}
					else {
						//an invalid value was sent which is not a number
						self.log('error', 'Error setting Output Channel Relative Value: Value passed is not a number.');
					}
				}
				else {
					//the channel selected was not found
					self.log('error', 'Error setting Output Channel Relative Value: Channel not found.');
				}				
			}
		}

		actions.setOutputChannelMute = {
			label: 'Set Output Channel Mute',
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: self.OUTPUT_CHANNELS[0].id,
					choices: self.OUTPUT_CHANNELS
				},
				{
					type: 'dropdown',
					label: 'Set to Mute State',
					id: 'option',
					default: 'true',
					choices: [
						{ id: 'true', label: 'Muted' },
						{ id: 'false', label: 'Unmuted' }
					]
				}
			],
			callback: function (action, bank) {
				let opt = action.options;

				let optValue = opt.option;
				self.parseVariables(optValue, function (value) {
					optValue = value;
				});

				let muteValue = (optValue === 'true');

				let obj = {};
				obj.leaApi = self.LEA_API;
				obj.url = `/amp/channels/${opt.channel}/output`;
				obj.method = 'set';
				obj.params = {
					mute: muteValue
				}
				obj.id = self.LEA_ID;

				self.sendCommand(obj);
			}
		}

		return actions
	}
}
