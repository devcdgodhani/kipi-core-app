import { EtaService } from '../../services/concrete/etaService';

const etaService = new EtaService();

async function runEtaTests() {
  console.log('Running ETA Tests...');

  try {
    const result = await etaService.calculateETA('400001', undefined, '110001');
    console.log('ETA Result:', JSON.stringify(result, null, 2));

    if (Array.isArray(result) && result.length > 0) {
      console.log('PASS: ETA returned multiple courier options');
    } else {
      console.error('FAIL: ETA did not return array');
    }
  } catch (error) {
    console.error('FAIL: ETA Calculation error', error);
  }
}

if (require.main === module) {
  runEtaTests();
}
