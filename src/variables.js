module.exports = {
	initVariables: function () {
		let self = this;
		let variables = []

		variables.push({ variableId: 'device_name', name: 'Device Name' });
		variables.push({ variableId: 'venue_name', name: 'Venue Name' });
		variables.push({ variableId: 'model', name: 'Model' });
		variables.push({ variableId: 'serial', name: 'Serial Number' });
		variables.push({ variableId: 'firmware', name: 'Firmware Version' });

		if (self.inputs) {
			for (let i = 0; i < self.inputs.length; i++) {
				variables.push({ variableId: `${self.inputs[i].type.toLowerCase()}_input_${self.inputs[i].id}_name`, name: `${self.inputs[i].type} Input Channel ${self.inputs[i].id} Name` });
			}
		}

		for (let i = 0; i < self.OUTPUT_CHANNELS.length; i++) {
			variables.push({ variableId: `output_${self.OUTPUT_CHANNELS[i].id}_name`, name: `Output Channel ${self.OUTPUT_CHANNELS[i].id} Name` });
			variables.push({ variableId: `output_${self.OUTPUT_CHANNELS[i].id}_primary`, name: `Output Channel ${self.OUTPUT_CHANNELS[i].id} Primary Input` });
			variables.push({ variableId: `output_${self.OUTPUT_CHANNELS[i].id}_secondary`, name: `Output Channel ${self.OUTPUT_CHANNELS[i].id} Secondary Input` });
			variables.push({ variableId: `output_${self.OUTPUT_CHANNELS[i].id}_fader`, name: `Output Channel ${self.OUTPUT_CHANNELS[i].id} Fader Level` });
			variables.push({ variableId: `output_${self.OUTPUT_CHANNELS[i].id}_mute`, name: `Output Channel ${self.OUTPUT_CHANNELS[i].id} Mute Status` });
		}

		self.setVariableDefinitions(variables);
	},

	checkVariables: function () {
		let self = this;

		try {
			let variableObj = {};

			if (self.initialData) {
				variableObj.device_name = self.initialData.deviceName;
				variableObj.venue_name = self.initialData.venueName;
				variableObj.model = self.initialData.modelID;
				variableObj.serial = self.initialData.serialNumber;
				variableObj.firmware = self.initialData.firmwareVersion;
			}

			if (self.inputs) {
				for (let i = 0; i < self.inputs.length; i++) {
					variableObj[`${self.inputs[i].type.toLowerCase()}_input_${self.inputs[i].id}_name`] = self.inputs[i].label;
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

					variableObj[`output_${self.OUTPUT_CHANNELS[i].id}_name`] = self.OUTPUT_CHANNELS[i].label;
					variableObj[`output_${self.OUTPUT_CHANNELS[i].id}_primary`] = primary;
					variableObj[`output_${self.OUTPUT_CHANNELS[i].id}_secondary`] = secondary;
					variableObj[`output_${self.OUTPUT_CHANNELS[i].id}_fader`] = faderLevel + ' dB';
					variableObj[`output_${self.OUTPUT_CHANNELS[i].id}_mute`] = muteStatus;
				}
			}

			self.setVariableValues(variableObj);
		}
		catch(error) {
			self.log('error', 'Error parsing Variables: ' + String(error))
		}
	}
}
