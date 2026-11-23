/**
 * Phase 1 & 2 Verification Suite
 * Tests Socket.IO initialization, JWT handshake authentication, and room lifecycle.
 */

const assert = require("assert");

// Mock dependencies before requiring socket/index.js
let mockJwtSecret = "test_knot_jwt_secret";
process.env.JWT_SECRET = mockJwtSecret;

let jwtVerifyBehavior = "valid";
let decodedPayload = { userId: "user-uuid-1234" };

const mockJwt = {
  verify: (token, secret) => {
    if (secret !== process.env.JWT_SECRET) {
      const err = new Error("invalid signature");
      err.name = "JsonWebTokenError";
      throw err;
    }
    if (jwtVerifyBehavior === "expired") {
      const err = new Error("jwt expired");
      err.name = "TokenExpiredError";
      throw err;
    }
    if (jwtVerifyBehavior === "invalid") {
      const err = new Error("invalid token");
      err.name = "JsonWebTokenError";
      throw err;
    }
    if (jwtVerifyBehavior === "missing_payload") {
      return {};
    }
    return decodedPayload;
  }
};

let capturedCorsOptions = null;
let registeredMiddleware = null;
let registeredConnectionHandler = null;

class MockServer {
  constructor(httpServer, options) {
    this.httpServer = httpServer;
    this.options = options;
    capturedCorsOptions = options.cors;
  }

  use(fn) {
    registeredMiddleware = fn;
  }

  on(event, handler) {
    if (event === "connection") {
      registeredConnectionHandler = handler;
    }
  }
}

// Inject mocks into require cache
const socketModulePath = require.resolve("../src/socket/index");
const jwtModulePath = "jsonwebtoken";
const socketIoModulePath = "socket.io";

require.cache[require.resolve("./verify_phase1_2.js")] = {
  id: "./verify_phase1_2.js",
  filename: "./verify_phase1_2.js",
  loaded: true
};

// Custom loader using Proxy to supply mocks for socket.io and jsonwebtoken
const Module = require("module");
const originalRequire = Module.prototype.require;

Module.prototype.require = function (id) {
  if (id === "socket.io") {
    return { Server: MockServer };
  }
  if (id === "jsonwebtoken") {
    return mockJwt;
  }
  return originalRequire.apply(this, arguments);
};

// Now require socket module
const { initSocket, getIO } = require("../src/socket/index");

async function runTests() {
  console.log("=================================================");
  console.log("   PHASE 1 & 2: SOCKET.IO & AUTH VERIFICATION   ");
  console.log("=================================================\n");

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
    }
  }

  // 1. Initialization and CORS
  test("initSocket initializes Socket.IO with CORS origins and credentials", () => {
    const mockHttpServer = {};
    const io = initSocket(mockHttpServer);
    assert.ok(io, "io instance should be returned");
    assert.deepStrictEqual(
      capturedCorsOptions.origin,
      ["http://localhost:5173", "http://127.0.0.1:5173"],
      "CORS origin matches Express config"
    );
    assert.strictEqual(capturedCorsOptions.credentials, true, "CORS credentials enabled");
    assert.strictEqual(getIO(), io, "getIO returns the initialized io instance");
  });

  // 2. Auth Middleware: Missing token
  test("Rejects handshake when token is missing", () => {
    let errorReturned = null;
    const socket = { handshake: { auth: {} } };
    registeredMiddleware(socket, (err) => {
      errorReturned = err;
    });
    assert.ok(errorReturned, "Expected an error");
    assert.strictEqual(errorReturned.message, "Authentication error: Token is required");
  });

  // 3. Auth Middleware: Missing JWT_SECRET
  test("Rejects handshake when JWT_SECRET is not configured", () => {
    delete process.env.JWT_SECRET;
    let errorReturned = null;
    const socket = { handshake: { auth: { token: "some_valid_looking_token" } } };
    registeredMiddleware(socket, (err) => {
      errorReturned = err;
    });
    process.env.JWT_SECRET = mockJwtSecret; // restore
    assert.ok(errorReturned, "Expected an error");
    assert.strictEqual(errorReturned.message, "Server error: JWT_SECRET is not configured");
  });

  // 4. Auth Middleware: Expired token
  test("Rejects handshake when token is expired", () => {
    jwtVerifyBehavior = "expired";
    let errorReturned = null;
    const socket = { handshake: { auth: { token: "expired_token" } } };
    registeredMiddleware(socket, (err) => {
      errorReturned = err;
    });
    assert.ok(errorReturned, "Expected an error");
    assert.strictEqual(errorReturned.message, "Authentication error: Token expired");
  });

  // 5. Auth Middleware: Invalid token signature
  test("Rejects handshake when token signature is invalid", () => {
    jwtVerifyBehavior = "invalid";
    let errorReturned = null;
    const socket = { handshake: { auth: { token: "corrupted_token" } } };
    registeredMiddleware(socket, (err) => {
      errorReturned = err;
    });
    assert.ok(errorReturned, "Expected an error");
    assert.strictEqual(errorReturned.message, "Authentication error: Invalid token");
  });

  // 6. Auth Middleware: Missing userId in payload
  test("Rejects handshake when payload does not contain userId", () => {
    jwtVerifyBehavior = "missing_payload";
    let errorReturned = null;
    const socket = { handshake: { auth: { token: "token_without_user_id" } } };
    registeredMiddleware(socket, (err) => {
      errorReturned = err;
    });
    assert.ok(errorReturned, "Expected an error");
    assert.strictEqual(errorReturned.message, "Authentication error: Invalid token payload");
  });

  // 7. Auth Middleware: Successful authentication with raw token
  test("Authenticates valid token and attaches socket.user = { id: userId }", () => {
    jwtVerifyBehavior = "valid";
    decodedPayload = { userId: "user-alice-uuid-0001" };
    let errorReturned = null;
    const socket = { handshake: { auth: { token: "valid_jwt_token" } } };
    registeredMiddleware(socket, (err) => {
      errorReturned = err;
    });
    assert.strictEqual(errorReturned, undefined, "Expected no error");
    assert.deepStrictEqual(socket.user, { id: "user-alice-uuid-0001" });
  });

  // 8. Auth Middleware: Successful authentication with Bearer prefix
  test("Handles 'Bearer ' prefixed token correctly", () => {
    jwtVerifyBehavior = "valid";
    decodedPayload = { userId: "user-bob-uuid-0002" };
    let errorReturned = null;
    const socket = { handshake: { auth: { token: "Bearer valid_jwt_token" } } };
    registeredMiddleware(socket, (err) => {
      errorReturned = err;
    });
    assert.strictEqual(errorReturned, undefined, "Expected no error");
    assert.deepStrictEqual(socket.user, { id: "user-bob-uuid-0002" });
  });

  // 9. Connection Lifecycle: Room Joining
  test("Authenticated socket joins personal room matching socket.user.id", () => {
    const joinedRooms = [];
    const registeredEvents = {};
    const mockSocket = {
      id: "socket-test-id-1",
      user: { id: "user-alice-uuid-0001" },
      join: (room) => joinedRooms.push(room),
      on: (event, handler) => {
        registeredEvents[event] = handler;
      }
    };

    registeredConnectionHandler(mockSocket);

    assert.ok(
      joinedRooms.includes("user-alice-uuid-0001"),
      "Socket joined user's personal room"
    );
    assert.strictEqual(typeof registeredEvents["disconnect"], "function", "Disconnect handler registered");
  });

  console.log("\n=================================================");
  console.log(`RESULTS: ${passed} / ${total} tests passed!`);
  console.log("=================================================\n");

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
