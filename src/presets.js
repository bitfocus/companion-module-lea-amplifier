const { combineRgb } = require('@companion-module/base')

module.exports = {
	initPresets: function () {
		let self = this;
		let presets = []

		const foregroundColor = combineRgb(255, 255, 255) // White
		const foregroundColorBlack = combineRgb(0, 0, 0) // Black
		const backgroundColorRed = combineRgb(255, 0, 0) // Red
		const backgroundColorGreen = combineRgb(0, 255, 0) // Green
		const backgroundColorOrange = combineRgb(255, 102, 0) // Orange

		for (let i = 0; i < self.OUTPUT_CHANNELS.length; i++) {
			presets.push({
				type: 'button',
				category: 'Fader Control',
				name: `Output Channel ${self.OUTPUT_CHANNELS[i].id} Fader Level`,
				style: {
					text: `Ch ${self.OUTPUT_CHANNELS[i].id}\\n$(lea-amp:output_${self.OUTPUT_CHANNELS[i].id}_fader)`,
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [],
				feedbacks: []
			})

			presets.push({
				type: 'button',
				category: 'Fader Control',
				name: `Output Channel ${self.OUTPUT_CHANNELS[i].id} Fader Up`,
				style: {
					text: `${self.OUTPUT_CHANNELS[i].id}\\n+`,
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [
					{
						down: [
							{
								actionId: 'setOutputChannelVolumeRelativeValue',
								options: {
									channel: self.OUTPUT_CHANNELS[i].id,
									value: '1.0'
								}
							}
						],
						up: []
					}
				],
				feedbacks: []
			})

			presets.push({
				type: 'button',
				category: 'Fader Control',
				name: `Channel ${self.OUTPUT_CHANNELS[i].id} Fader Down`,
				style: {
					text: `${self.OUTPUT_CHANNELS[i].id}\\n-`,
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [
					{
						down: [
							{
								actionId: 'setOutputChannelVolumeRelativeValue',
								options: {
									channel: self.OUTPUT_CHANNELS[i].id,
									value: '-1.0'
								}
							}
						],
						up: []
					}
				],
				feedbacks: []
			})
		}

		for (let i = 0; i < self.OUTPUT_CHANNELS.length; i++) {
			presets.push({
				type: 'button',
				category: 'Mute Control',
				name: `Channel ${self.OUTPUT_CHANNELS[i].id} Mute`,
				style: {
					text: `Mute\\n${self.OUTPUT_CHANNELS[i].id}`,
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
					latch: true
				},
				steps: [
					{
						down: [
							{
								actionId: 'setOutputChannelMute',
								options: {
									channel: self.OUTPUT_CHANNELS[i].id,
									option: 'true'
								}
							}
						],
						up: [
							{
								action: 'setOutputChannelMute',
								options: {
									channel: self.OUTPUT_CHANNELS[i].id,
									option: 'false'
								}
							}
						]
					}
				],
				feedbacks: [
					{
						feedbackId: 'muteState',
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
						feedbackId: 'muteState',
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

		self.setPresetDefinitions(presets);
	}
}