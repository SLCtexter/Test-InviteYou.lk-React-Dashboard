const functions = require('firebase-functions');
const crypto = require('crypto');


const MERCHANT_ID = '1234923';
const MERCHANT_SECRET_BASE64 = 'NzIxNTYzNjYyMTYwOTU4NjUyMzIzODM1MTEyMzE2MDA1MTcxNzY=';
const CURRENCY = 'LKR';

exports.generatePayHereHash = functions.https.onCall(async (data, context) => {
  const { orderId, amount } = data;

  const formattedAmount = parseFloat(amount).toFixed(2);

  const merchantSecret = Buffer.from(MERCHANT_SECRET_BASE64, 'base64').toString();


  const md5Secret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
  const hashString = MERCHANT_ID + orderId + formattedAmount + CURRENCY + md5Secret;
  const hash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();

  return { hash };
});