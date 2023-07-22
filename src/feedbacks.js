const { combineRgb } = require('@companion-module/base')

module.exports = {
	initFeedbacks: function () {
		let self = this
		let feedbacks = {}

		const foregroundColor = combineRgb(255, 255, 255) // White
		const backgroundColorRed = combineRgb(255, 0, 0) // Red

		feedbacks.muteState = {
			type: 'boolean',
			name: 'Output Channel Mute State',
			description: 'Indicate Output Channel Mute is in X State',
			style: {
				color: foregroundColor,
				bgcolor: backgroundColorRed
			},
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
					label: 'Indicate in X State',
					id: 'option',
					default: 'true',
					choices: [
						{ id: 'true', label: 'Muted' },
						{ id: 'false', label: 'Unmuted' }
					]
				}
			],
			callback: function (feedback, bank) {
				var opt = feedback.options

				let objChannel = self.ampData[opt.channel];

				if (objChannel) {
					if (objChannel.output) {						
						if (objChannel.output.hasOwnProperty('mute')) {
							if (objChannel.output.mute.toString() == opt.option) {
								return true;
							}
						}
					}
				}

				return false
			}
		}

		self.setFeedbackDefinitions(feedbacks);
	}
}
