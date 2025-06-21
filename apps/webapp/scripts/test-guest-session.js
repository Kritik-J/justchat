/**
 * Test script for guest session functionality
 * Run with: node scripts/test-guest-session.js
 */

// Simulate localStorage for Node.js environment
global.localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  },
};

// Simulate crypto.randomUUID for Node.js environment
global.crypto = {
  randomUUID() {
    return "test-uuid-" + Math.random().toString(36).substr(2, 9);
  },
};

// Simulate document.cookie for Node.js environment
global.document = {
  cookie: "",
  set cookie(value) {
    this.cookie = value;
  },
  get cookie() {
    return this.cookie;
  },
};

console.log("🧪 Testing Guest Session Functionality...\n");

// Test 1: Guest Session ID Generation
console.log("1. Testing guest session ID generation...");
const {
  guestSessionClient,
} = require("../app/services/guestSession.client.ts");

const sessionId1 = guestSessionClient.getGuestSessionId();
const sessionId2 = guestSessionClient.getGuestSessionId();

console.log(`   First call: ${sessionId1}`);
console.log(`   Second call: ${sessionId2}`);
console.log(`   IDs match: ${sessionId1 === sessionId2 ? "✅" : "❌"}`);

// Test 2: Has Guest Session
console.log("\n2. Testing hasGuestSession...");
const hasSession = guestSessionClient.hasGuestSession();
console.log(`   Has session: ${hasSession ? "✅" : "❌"}`);

// Test 3: Cookie Setting
console.log("\n3. Testing cookie setting...");
console.log(`   Cookie value: ${document.cookie}`);

// Test 4: Debug Info
console.log("\n4. Testing debug info...");
const debugInfo = guestSessionClient.getDebugInfo();
console.log("   Debug info:", JSON.stringify(debugInfo, null, 2));

// Test 5: Clear Session
console.log("\n5. Testing session clearing...");
guestSessionClient.clearGuestSession();
const hasSessionAfterClear = guestSessionClient.hasGuestSession();
console.log(
  `   Has session after clear: ${hasSessionAfterClear ? "❌" : "✅"}`
);

console.log("\n✅ Guest session tests completed!");
console.log("\n📝 To test the full functionality:");
console.log("   1. Start the development server: npm run dev");
console.log("   2. Open the app in a browser");
console.log("   3. Start chatting as a guest (without logging in)");
console.log("   4. Check that threads appear in the sidebar");
console.log("   5. Log in with magic link");
console.log("   6. Verify guest sessions sync to your account");
