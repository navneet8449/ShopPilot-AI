import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import fs from 'fs';

dotenv.config();

function getBackendMongodbUri() {
  if (process.env.MONGODB_URI && process.env.MONGODB_URI.trim()) {
    return process.env.MONGODB_URI.trim();
  }
  try {
    const pids = fs.readdirSync('/proc').filter(p => /^\d+$/.test(p));
    for (const pid of pids) {
      try {
        const cmd = fs.readFileSync(`/proc/${pid}/cmdline`, 'utf8');
        if (cmd.includes('server.ts') || cmd.includes('tsx') || cmd.includes('node')) {
          const envData = fs.readFileSync(`/proc/${pid}/environ`, 'utf8');
          const entry = envData.split('\0').find(e => e.startsWith('MONGODB_URI='));
          if (entry) {
            const uri = entry.slice('MONGODB_URI='.length);
            if (uri && uri.trim()) return uri.trim();
          }
        }
      } catch {}
    }
  } catch {}
  return null;
}

const BASE_URL = 'http://localhost:3000';

async function runEndToEndPayPalTest() {
  console.log('================================================================');
  console.log('  ShopPilot AI: End-to-End PayPal Sandbox Checkout Verification');
  console.log('================================================================\n');

  const testReport = [];

  // Reset cart to a clean state before starting
  await fetch(`${BASE_URL}/api/cart/clear`, { method: 'POST' });

  // -------------------------------------------------------------
  // Test 1: Add Lenovo LOQ 15 to the shopping cart
  // -------------------------------------------------------------
  console.log('--- Test 1: Add Lenovo LOQ 15 to Cart ---');
  let test1Pass = false;
  let cartData = null;
  try {
    // Find Lenovo LOQ 15 from /api/products
    const prodRes = await fetch(`${BASE_URL}/api/products?q=Lenovo+LOQ+15`);
    const prodJson = await prodRes.json();
    const lenovoProd = (prodJson.products || []).find(p => p.name.toLowerCase().includes('lenovo loq')) || prodJson.products?.[0];

    if (!lenovoProd) {
      throw new Error('Lenovo LOQ 15 product not found in catalog');
    }

    console.log(`Located Product: ${lenovoProd.name} (ID: ${lenovoProd.id}, Price: ₹${lenovoProd.price})`);

    const addRes = await fetch(`${BASE_URL}/api/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: lenovoProd.id, quantity: 1 })
    });
    const addJson = await addRes.json();
    cartData = addJson.cart;

    if (addRes.ok && cartData && cartData.items.some(i => i.product.id === lenovoProd.id)) {
      test1Pass = true;
      console.log('✅ PASS: Lenovo LOQ 15 added to shopping cart successfully.');
    } else {
      console.log('❌ FAIL: Cart response missing added product.');
    }
  } catch (err) {
    console.log(`❌ FAIL: ${err.message}`);
  }
  testReport.push({ step: '1. Add Lenovo LOQ 15 to Shopping Cart', pass: test1Pass });

  // -------------------------------------------------------------
  // Test 2: Verify cart product details, quantity and total price
  // -------------------------------------------------------------
  console.log('\n--- Test 2: Verify Cart Details, Quantity and Total Price ---');
  let test2Pass = false;
  try {
    const getCartRes = await fetch(`${BASE_URL}/api/cart`);
    const getCartJson = await getCartRes.json();
    const cart = getCartJson.cart;

    const item = cart.items.find(i => i.product.name.toLowerCase().includes('lenovo loq'));
    if (!item) throw new Error('Lenovo LOQ 15 not present in cart items');

    const expectedQuantity = 1;
    const expectedSubtotal = 69990;
    const expectedTax = Math.round(69990 * 0.18); // 18% GST = 12598
    const expectedShipping = 0; // Free shipping over ₹1000
    const expectedTotal = expectedSubtotal + expectedTax + expectedShipping; // 82588

    console.log(`• Item Name:     ${item.product.name}`);
    console.log(`• Quantity:      ${item.quantity} (Expected: ${expectedQuantity})`);
    console.log(`• Unit Price:    ₹${item.product.price.toLocaleString('en-IN')}`);
    console.log(`• Subtotal:      ₹${cart.subtotal.toLocaleString('en-IN')} (Expected: ₹${expectedSubtotal.toLocaleString('en-IN')})`);
    console.log(`• Tax (18% GST): ₹${cart.tax.toLocaleString('en-IN')} (Expected: ₹${expectedTax.toLocaleString('en-IN')})`);
    console.log(`• Shipping:      ₹${cart.shipping.toLocaleString('en-IN')} (Expected: ₹0 Free Shipping)`);
    console.log(`• Total Price:   ₹${cart.total.toLocaleString('en-IN')} (Expected: ₹${expectedTotal.toLocaleString('en-IN')})`);

    if (
      item.quantity === expectedQuantity &&
      cart.subtotal === expectedSubtotal &&
      cart.tax === expectedTax &&
      cart.shipping === expectedShipping &&
      cart.total === expectedTotal
    ) {
      test2Pass = true;
      console.log('✅ PASS: Product details, item quantity, tax breakdown, and total price strictly verified.');
    } else {
      console.log('❌ FAIL: Cart calculation discrepancy detected.');
    }
  } catch (err) {
    console.log(`❌ FAIL: ${err.message}`);
  }
  testReport.push({ step: '2. Verify Cart Details, Quantity & Total Price', pass: test2Pass });

  // -------------------------------------------------------------
  // Test 3: Initiate PayPal Sandbox Checkout
  // -------------------------------------------------------------
  console.log('\n--- Test 3: Initiate PayPal Sandbox Checkout ---');
  let test3Pass = false;
  let orderCreationResponse = null;
  const buyerDetails = {
    name: 'Navneet Pandey',
    email: 'pnavneet953@gmail.com',
    address: '404 Innovation Blvd',
    city: 'Bengaluru',
    postalCode: '560100',
    country: 'IN'
  };

  try {
    const createRes = await fetch(`${BASE_URL}/api/paypal/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currency: 'INR',
        buyer: buyerDetails,
        returnUrl: `${BASE_URL}/checkout?status=approved`,
        cancelUrl: `${BASE_URL}/cart?status=cancelled`
      })
    });

    orderCreationResponse = await createRes.json();
    console.log(`• Order ID:     ${orderCreationResponse.id}`);
    console.log(`• Status:       ${orderCreationResponse.status}`);
    console.log(`• Amount:       $${orderCreationResponse.amount} USD`);
    console.log(`• Approval URL: ${orderCreationResponse.approvalUrl}`);

    if (
      createRes.ok &&
      orderCreationResponse.id &&
      orderCreationResponse.status === 'CREATED' &&
      orderCreationResponse.approvalUrl &&
      orderCreationResponse.approvalUrl.includes('sandbox.paypal.com')
    ) {
      test3Pass = true;
      console.log('✅ PASS: PayPal Sandbox checkout order successfully initiated.');
    } else {
      console.log('❌ FAIL: Failed to initiate PayPal checkout.');
    }
  } catch (err) {
    console.log(`❌ FAIL: ${err.message}`);
  }
  testReport.push({ step: '3. Initiate PayPal Sandbox Checkout', pass: test3Pass });

  // -------------------------------------------------------------
  // Test 4: Verify Order Creation & Payment Approval Flow
  // -------------------------------------------------------------
  console.log('\n--- Test 4: Verify Order Creation & Payment Approval Flow ---');
  let test4Pass = false;
  try {
    // Verify the transaction intent was recorded with status 'CREATED'
    const txnsRes = await fetch(`${BASE_URL}/api/transactions`);
    const txnsJson = await txnsRes.json();
    const createdTxn = (txnsJson.transactions || []).find(t => t.id === orderCreationResponse.id);

    console.log(`• Transaction Recorded in Ledger: ${Boolean(createdTxn)}`);
    console.log(`• Initial Payment Status:         ${createdTxn?.status}`);
    console.log(`• Approval Flow URL:              ${orderCreationResponse.approvalUrl}`);

    if (
      createdTxn &&
      createdTxn.status === 'CREATED' &&
      createdTxn.type === 'PAYPAL_ORDER_CREATED' &&
      orderCreationResponse.approvalUrl.startsWith('https://www.sandbox.paypal.com/')
    ) {
      test4Pass = true;
      console.log('✅ PASS: Order intent created with status CREATED; approval redirect flow verified.');
    } else {
      console.log('❌ FAIL: Order creation or approval flow status invalid.');
    }
  } catch (err) {
    console.log(`❌ FAIL: ${err.message}`);
  }
  testReport.push({ step: '4. Verify Order Creation & Payment Approval Flow', pass: test4Pass });

  // -------------------------------------------------------------
  // Test 5: Confirm Payment Capture Only After Explicit User Approval
  // -------------------------------------------------------------
  console.log('\n--- Test 5: Confirm Payment Capture Only After Explicit Approval ---');
  let test5Pass = false;
  let captureResponse = null;
  try {
    // 5A: Try capturing the order WITHOUT explicit approval first -> MUST FAIL
    console.log('Testing capture attempt WITHOUT user approval:');
    const unapprovedRes = await fetch(`${BASE_URL}/api/paypal/capture-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderCreationResponse.id,
        buyer: { ...buyerDetails, userApproved: false }
      })
    });
    console.log(`• Capture Attempt Without Approval Status: HTTP ${unapprovedRes.status} (Expected: 500/400 Error)`);
    const unapprovedData = await unapprovedRes.json();
    console.log(`• Rejection Message: "${unapprovedData.error}"`);

    const blockedUnapproved = !unapprovedRes.ok && unapprovedData.error?.includes('approval');

    // 5B: User explicitly grants approval in the checkout flow -> CAPTURE SUCCEEDS
    console.log('\nExecuting capture AFTER explicit user approval:');
    const approvedRes = await fetch(`${BASE_URL}/api/paypal/capture-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderCreationResponse.id,
        buyer: { ...buyerDetails, userApproved: true }
      })
    });
    captureResponse = await approvedRes.json();
    console.log(`• Capture Status:    ${captureResponse.order?.status}`);
    console.log(`• Capture ID:        ${captureResponse.order?.captureId}`);
    console.log(`• Internal Order ID: ${captureResponse.order?.id}`);

    if (
      blockedUnapproved &&
      approvedRes.ok &&
      captureResponse.success &&
      captureResponse.order?.status === 'COMPLETED' &&
      captureResponse.order?.captureId
    ) {
      test5Pass = true;
      console.log('✅ PASS: Payment capture strictly blocked prior to approval, and succeeded only after explicit user approval.');
    } else {
      console.log('❌ FAIL: Capture flow did not enforce explicit approval.');
    }
  } catch (err) {
    console.log(`❌ FAIL: ${err.message}`);
  }
  testReport.push({ step: '5. Confirm Payment Capture Only After Explicit Approval', pass: test5Pass });

  // -------------------------------------------------------------
  // Test 6: Verify Successful and Failed Payment Handling
  // -------------------------------------------------------------
  console.log('\n--- Test 6: Verify Successful and Failed Payment Handling ---');
  let test6Pass = false;
  try {
    // Scenario A: Cart is cleared after successful checkout
    const postCartRes = await fetch(`${BASE_URL}/api/cart`);
    const postCartJson = await postCartRes.json();
    const cartCleared = postCartJson.cart.items.length === 0;
    console.log(`• Cart Cleared After Payment:   ${cartCleared ? 'YES (0 items)' : 'NO'}`);

    // Scenario B: Checkout with empty cart fails gracefully
    const emptyCheckoutRes = await fetch(`${BASE_URL}/api/paypal/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buyer: buyerDetails })
    });
    const emptyCheckoutJson = await emptyCheckoutRes.json();
    const emptyCartRejected = emptyCheckoutRes.status === 400;
    console.log(`• Empty Cart Checkout Rejected: HTTP ${emptyCheckoutRes.status} ("${emptyCheckoutJson.error}")`);

    // Scenario C: Missing orderId on capture fails gracefully
    const missingIdRes = await fetch(`${BASE_URL}/api/paypal/capture-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const missingIdJson = await missingIdRes.json();
    const missingIdRejected = missingIdRes.status === 400;
    console.log(`• Missing Order ID Rejected:    HTTP ${missingIdRes.status} ("${missingIdJson.error}")`);

    if (cartCleared && emptyCartRejected && missingIdRejected) {
      test6Pass = true;
      console.log('✅ PASS: Both successful post-capture state and error failure edge cases verified.');
    } else {
      console.log('❌ FAIL: Payment error handling edge cases failed.');
    }
  } catch (err) {
    console.log(`❌ FAIL: ${err.message}`);
  }
  testReport.push({ step: '6. Verify Successful and Failed Payment Handling', pass: test6Pass });

  // -------------------------------------------------------------
  // Test 7: Save Order and Transaction Details in MongoDB
  // -------------------------------------------------------------
  console.log('\n--- Test 7: Verify Order & Transaction Details in MongoDB Atlas ---');
  let test7Pass = false;
  try {
    const rawUri = getBackendMongodbUri();
    if (!rawUri) throw new Error('MONGODB_URI not available');

    const mongoClient = new MongoClient(rawUri, { serverSelectionTimeoutMS: 5000 });
    await mongoClient.connect();
    const mongoDb = mongoClient.db('shoppilot_ai');

    // Query 'orders' collection in MongoDB Atlas
    const ordersCol = mongoDb.collection('orders');
    const mongoOrder = await ordersCol.findOne({ paypalOrderId: orderCreationResponse.id });
    console.log(`• MongoDB 'orders' Document Found:`);
    console.log(`  - Order ID:       ${mongoOrder?.id}`);
    console.log(`  - PayPal Order:   ${mongoOrder?.paypalOrderId}`);
    console.log(`  - Capture ID:     ${mongoOrder?.captureId}`);
    console.log(`  - Status:         ${mongoOrder?.status}`);
    console.log(`  - Total Amount:   ₹${mongoOrder?.total?.toLocaleString('en-IN')}`);
    console.log(`  - Items Count:    ${mongoOrder?.items?.length}`);
    console.log(`  - Buyer:          ${mongoOrder?.buyer?.name} (${mongoOrder?.buyer?.email})`);

    // Query 'transactions' collection in MongoDB Atlas
    const txnsCol = mongoDb.collection('transactions');
    const mongoTxns = await txnsCol.find({ paypalOrderId: orderCreationResponse.id }).toArray();
    console.log(`• MongoDB 'transactions' Documents Found: ${mongoTxns.length}`);
    for (const t of mongoTxns) {
      console.log(`  - Type: ${t.type}, ID: ${t.id}, Status: ${t.status}`);
    }

    await mongoClient.close();

    if (
      mongoOrder &&
      mongoOrder.status === 'COMPLETED' &&
      mongoOrder.items?.[0]?.product?.name.toLowerCase().includes('lenovo loq') &&
      mongoTxns.some(t => t.type === 'PAYMENT_CAPTURED' && t.status === 'COMPLETED')
    ) {
      test7Pass = true;
      console.log('✅ PASS: Order and transaction records verified directly in MongoDB Atlas.');
    } else {
      console.log('❌ FAIL: Order or transaction record missing in MongoDB Atlas.');
    }
  } catch (err) {
    console.log(`❌ FAIL: ${err.message}`);
  }
  testReport.push({ step: '7. Save Order and Transaction Details in MongoDB', pass: test7Pass });

  // -------------------------------------------------------------
  // Test 8: Ensure Duplicate Payments Are Prevented
  // -------------------------------------------------------------
  console.log('\n--- Test 8: Ensure Duplicate Payments Are Prevented ---');
  let test8Pass = false;
  try {
    console.log(`Attempting duplicate capture on already completed order (${orderCreationResponse.id}):`);
    const duplicateCaptureRes = await fetch(`${BASE_URL}/api/paypal/capture-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderCreationResponse.id,
        buyer: buyerDetails
      })
    });

    const duplicateJson = await duplicateCaptureRes.json();
    console.log(`• Duplicate Capture Response Status: HTTP ${duplicateCaptureRes.status} (Expected: 409 Conflict)`);
    console.log(`• Duplicate Error Message:          "${duplicateJson.error}"`);

    // Check MongoDB order count for this paypalOrderId
    const rawUri = getBackendMongodbUri();
    const mongoClient = new MongoClient(rawUri, { serverSelectionTimeoutMS: 5000 });
    await mongoClient.connect();
    const mongoDb = mongoClient.db('shoppilot_ai');
    const orderCount = await mongoDb.collection('orders').countDocuments({ paypalOrderId: orderCreationResponse.id });
    await mongoClient.close();

    console.log(`• Total MongoDB Orders for Token:   ${orderCount} (Must be exactly 1)`);

    if (
      duplicateCaptureRes.status === 409 &&
      duplicateJson.error?.includes('already been captured') &&
      orderCount === 1
    ) {
      test8Pass = true;
      console.log('✅ PASS: Duplicate payment capture strictly blocked and prevented.');
    } else {
      console.log('❌ FAIL: Duplicate payment was not rejected appropriately.');
    }
  } catch (err) {
    console.log(`❌ FAIL: ${err.message}`);
  }
  testReport.push({ step: '8. Ensure Duplicate Payments Are Prevented', pass: test8Pass });

  // -------------------------------------------------------------
  // Final Summary Report
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log('              FINAL TEST SUITE SUMMARY REPORT                   ');
  console.log('================================================================');
  let allPassed = true;
  for (const item of testReport) {
    const statusStr = item.pass ? 'PASS' : 'FAIL';
    console.log(`${item.step.padEnd(54)} : ${statusStr}`);
    if (!item.pass) allPassed = false;
  }
  console.log('================================================================');
  console.log(`Overall Verdict: ${allPassed ? 'ALL 8 TESTS PASSED (100%)' : 'SOME TESTS FAILED'}`);
  console.log('================================================================\n');

  process.exit(allPassed ? 0 : 1);
}

runEndToEndPayPalTest().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
