module.exports = {
	setPresets: function () {
		let self = this;
		let presets = []

		const foregroundColor = self.rgb(255, 255, 255) // White
		const foregroundColorBlack = self.rgb(0, 0, 0) // Black
		const backgroundColorRed = self.rgb(255, 0, 0) // Red
		const backgroundColorGreen = self.rgb(0, 255, 0) // Green
		const backgroundColorOrange = self.rgb(255, 102, 0) // Orange

		for (let i = 0; i < self.OUTPUT_CHANNELS.length; i++) {
			presets.push({
				category: 'Fader Control',
				label: `Output Channel ${self.OUTPUT_CHANNELS[i].id} Fader Up`,
				bank: {
					style: 'text',
					text: `Ch ${self.OUTPUT_CHANNELS[i].id}\\n$(lea-amp:output_${self.OUTPUT_CHANNELS[i].id}_fader)`,
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				}
			})

			presets.push({
				category: 'Fader Control',
				label: `Output Channel ${self.OUTPUT_CHANNELS[i].id} Fader Up`,
				bank: {
					style: 'text',
					text: `${self.OUTPUT_CHANNELS[i].id}\\n+`,
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'setOutputChannelVolumeRelativeValue',
						options: {
							channel: self.OUTPUT_CHANNELS[i].id,
							value: '1.0'
						}
					}
				]
			})

			presets.push({
				category: 'Fader Control',
				label: `Channel ${self.OUTPUT_CHANNELS[i].id} Fader Down`,
				bank: {
					style: 'text',
					text: `${self.OUTPUT_CHANNELS[i].id}\\n-`,
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'setOutputChannelVolumeRelativeValue',
						options: {
							channel: self.OUTPUT_CHANNELS[i].id,
							value: '-1.0'
						}
					}
				]
			})
		}

		for (let i = 0; i < self.OUTPUT_CHANNELS.length; i++) {
			presets.push({
				category: 'Mute Control',
				label: `Channel ${self.OUTPUT_CHANNELS[i].id} Mute`,
				bank: {
					style: 'text',
					text: `Mute\\n${self.OUTPUT_CHANNELS[i].id}`,
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
					latch: true
				},
				actions: [
					{
						action: 'setOutputChannelMute',
						options: {
							channel: self.OUTPUT_CHANNELS[i].id,
							option: 'true'
						}
					}
				],
				release_actions: [
					{
						action: 'setOutputChannelMute',
						options: {
							channel: self.OUTPUT_CHANNELS[i].id,
							option: 'false'
						}
					}
				],
				feedbacks: [
					{
						type: 'muteState',
						options: {
							channel: self.OUTPUT_CHANNELS[i].id,
							option: 'false',
						},
						style: {
							color: foregroundColorBlack,
							bgcolor: backgroundColorGreen
						}
					},
					{
						type: 'muteState',
						options: {
							channel: self.OUTPUT_CHANNELS[i].id,
							option: 'true',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed
						}
					}
				]
			})
		}

		return presets
	}
}