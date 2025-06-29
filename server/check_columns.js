const { executeQuery } = require('./config/db');

async function checkColumns() {
  try {
    const [result] = await executeQuery('DESCRIBE purchase_orders');
    console.log('Purchase Orders table columns:');
    result.forEach(column => {
      console.log(`- ${column.Field} (${column.Type})`);
    });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

checkColumns(); 