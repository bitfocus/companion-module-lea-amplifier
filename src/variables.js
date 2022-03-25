module.exports = {
	// ##########################
	// #### Define Variables ####
	// ##########################
	setVariables: function () {
		let self = this;
		let variables = []

		variables.push({ name: 'device_name', label: 'Device Name' });
		variables.push({ name: 'venue_name', label: 'Venue Name' });
		variables.push({ name: 'model', label: 'Model' });
		variables.push({ name: 'serial', label: 'Serial Number' });
		variables.push({ name: 'firmware', label: 'Firmware Version' });

		if (self.inputs) {
			for (let i = 0; i < self.inputs.length; i++) {
				variables.push({ name: `${self.inputs[i].type.toLowerCase()}_input_${self.inputs[i].id}_name`, label: `${self.inputs[i].type} Input Channel ${self.inputs[i].id} Name` });
			}
		}

		for (let i = 0; i < self.OUTPUT_CHANNELS.length; i++) {
			variables.push({ name: `output_${self.OUTPUT_CHANNELS[i].id}_name`, label: `Output Channel ${self.OUTPUT_CHANNELS[i].id} Name` });
			variables.push({ name: `output_${self.OUTPUT_CHANNELS[i].id}_primary`, label: `Output Channel ${self.OUTPUT_CHANNELS[i].id} Primary Input` });
			variables.push({ name: `output_${self.OUTPUT_CHANNELS[i].id}_secondary`, label: `Output Channel ${self.OUTPUT_CHANNELS[i].id} Secondary Input` });
			variables.push({ name: `output_${self.OUTPUT_CHANNELS[i].id}_fader`, label: `Output Channel ${self.OUTPUT_CHANNELS[i].id} Fader Level` });
			variables.push({ name: `output_${self.OUTPUT_CHANNELS[i].id}_mute`, label: `Output Channel ${self.OUTPUT_CHANNELS[i].id} Mute Status` });
		}

		return variables
	},

	// #########################
	// #### Check Variables ####
	// #########################
	checkVariables: function () {
		let self = this;

		try {
			if (self.initialData) {
				self.setVariable('device_name', self.initialData.deviceName);
				self.setVariable('venue_name', self.initialData.venueName);
				self.setVariable('model', self.initialData.modelID);
				self.setVariable('serial', self.initialData.serialNumber);
				self.setVariable('firmware', self.initialData.firmwareVersion);
			}

			if (self.inputs) {
				for (let i = 0; i < self.inputs.length; i++) {
					self.setVariable(`${self.inputs[i].type.toLowerCase()}_input_${self.inputs[i].id}_name`, self.inputs[i].label);
				}
			}

			if (self.ampData) {
				for (let i = 0; i < self.OUTPUT_CHANNELS.length; i++) {
					let objChannel = self.ampData[self.OUTPUT_CHANNELS[i].id];

					let primary = '';
					let secondary = '';

					let faderLevel = '';
					let muteStatus = '';

					if (objChannel) {
						primary = self.ampData[self.OUTPUT_CHANNELS[i].id].inputSelector.primary;
						secondary = self.ampData[self.OUTPUT_CHANNELS[i].id].inputSelector.secondary;

						faderLevel = Number.parseFloat(objChannel.output.fader).toFixed(1);
						if (isNaN(faderLevel)) {
							faderLevel = '';
						}

						muteStatus = (self.ampData[self.OUTPUT_CHANNELS[i].id].output.mute ? 'Muted' : 'Unmuted');
					}

					self.setVariable(`output_${self.OUTPUT_CHANNELS[i].id}_name`, self.OUTPUT_CHANNELS[i].label);
					self.setVariable(`output_${self.OUTPUT_CHANNELS[i].id}_primary`, primary);
					self.setVariable(`output_${self.OUTPUT_CHANNELS[i].id}_secondary`, secondary);
					self.setVariable(`output_${self.OUTPUT_CHANNELS[i].id}_fader`, faderLevel + ' dB');
					self.setVariable(`output_${self.OUTPUT_CHANNELS[i].id}_mute`, muteStatus);
				}
			}
		}
		catch(error) {
			self.log('error', 'Error parsing Variables: ' + String(error))
		}
	}
}
