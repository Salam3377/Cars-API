const mongoose = require('mongoose')

const carSchema = new mongoose.Schema(
	{
		brand: {
			type: String,
			required: true,
		},
		model: {
			type: String,
			required: true,
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('Car', carSchema)
