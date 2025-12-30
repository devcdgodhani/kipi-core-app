
const mongoose = require('mongoose');

async function checkLots() {
  try {
    await mongoose.connect('mongodb://localhost:27017/express_boilerplate'); // Adjust DB name if needed
    const Lot = mongoose.model('Lot', new mongoose.Schema({}, { strict: false }), 'lots');
    const lots = await Lot.find({}).limit(5);
    console.log(JSON.stringify(lots, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkLots();
