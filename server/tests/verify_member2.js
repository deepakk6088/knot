/**
 * Member 2 Verification & Test Suite
 * Tests:
 * 1. Participant normalization & duplicate prevention
 * 2. Self-conversation prevention
 * 3. Conversation creation and retrieval
 * 4. Message creation, participant validation, and status transitions
 * 5. Message pagination & chronological ordering
 * 6. Unauthorized access prevention (403 Forbidden for non-participants)
 */

const { normalizeParticipants } = require("../src/services/conversationService");

async function runMember2UnitTests() {
  console.log("=================================================");
  console.log("   MEMBER 2: CONVERSATIONS & MESSAGES TEST SUITE  ");
  console.log("=================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
    }
  }

  // TEST 1: Deterministic participant ordering (Duplicate Prevention)
  console.log("1. Testing Deterministic Normalization (Duplicate Prevention)...");
  const userA = "11111111-1111-1111-1111-111111111111";
  const userB = "22222222-2222-2222-2222-222222222222";

  const pair1 = normalizeParticipants(userA, userB);
  const pair2 = normalizeParticipants(userB, userA);

  assert(
    pair1.userOneId === userA && pair1.userTwoId === userB,
    "normalizeParticipants correctly orders (userA, userB)"
  );
  assert(
    pair2.userOneId === userA && pair2.userTwoId === userB,
    "normalizeParticipants(userB, userA) produces identical (userOneId, userTwoId)"
  );
  assert(
    pair1.userOneId === pair2.userOneId && pair1.userTwoId === pair2.userTwoId,
    "Duplicate conversation prevention guaranteed: (A, B) === (B, A)"
  );

  // TEST 2: Self-conversation rejection
  console.log("\n2. Testing Self-Conversation Prevention...");
  try {
    normalizeParticipants(userA, userA);
    assert(false, "Should have thrown an error for self-conversation");
  } catch (err) {
    assert(
      err.message === "Cannot create a conversation with yourself",
      "Correctly rejects conversation with self"
    );
  }

  // TEST 3: Mock Database Operations for Conversation & Messages
  console.log("\n3. Testing Mock Database Flow for Conversation & Messages...");
  const mockDb = {
    users: [
      { id: userA, username: "alice", displayName: "Alice" },
      { id: userB, username: "bob", displayName: "Bob" },
      { id: "33333333-3333-3333-3333-333333333333", username: "charlie", displayName: "Charlie" }
    ],
    conversations: [],
    messages: []
  };

  // Simulate conversation creation
  function mockCreateOrGetConversation(cUser, tUser) {
    const { userOneId, userTwoId } = normalizeParticipants(cUser, tUser);
    let conv = mockDb.conversations.find(
      (c) => c.userOneId === userOneId && c.userTwoId === userTwoId
    );
    if (!conv) {
      conv = {
        id: "conv-uuid-1",
        userOneId,
        userTwoId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockDb.conversations.push(conv);
    }
    return conv;
  }

  const conv1 = mockCreateOrGetConversation(userA, userB);
  const conv2 = mockCreateOrGetConversation(userB, userA);

  assert(conv1.id === conv2.id, "Second call returns existing conversation without creating duplicate");
  assert(mockDb.conversations.length === 1, "Database contains exactly 1 conversation for the user pair");

  // TEST 4: Message Creation & Participant Validation
  console.log("\n4. Testing Message Creation & Participant Validation...");
  function mockSendMessage(conversationId, senderId, content) {
    const conv = mockDb.conversations.find((c) => c.id === conversationId);
    if (!conv) throw new Error("Conversation not found");
    if (conv.userOneId !== senderId && conv.userTwoId !== senderId) {
      const err = new Error("Access denied: You are not a participant in this conversation");
      err.statusCode = 403;
      throw err;
    }
    const msg = {
      id: "msg-" + (mockDb.messages.length + 1),
      conversationId,
      senderId,
      content,
      status: "SENT",
      createdAt: new Date(Date.now() + mockDb.messages.length * 1000)
    };
    mockDb.messages.push(msg);
    conv.updatedAt = msg.createdAt;
    return msg;
  }

  const m1 = mockSendMessage(conv1.id, userA, "Hello Bob!");
  const m2 = mockSendMessage(conv1.id, userB, "Hey Alice! How are you?");
  const m3 = mockSendMessage(conv1.id, userA, "Working on the KNOT major project!");

  assert(mockDb.messages.length === 3, "All 3 messages persisted successfully");
  assert(m1.status === "SENT", "New messages default to SENT status");

  // TEST 5: Unauthorized Third-party Validation
  console.log("\n5. Testing Unauthorized Participant Access...");
  try {
    mockSendMessage(conv1.id, "33333333-3333-3333-3333-333333333333", "Sneaking in...");
    assert(false, "Third user should not be allowed to send message to conversation");
  } catch (err) {
    assert(
      err.statusCode === 403,
      "Third party user correctly rejected with 403 Forbidden"
    );
  }

  // TEST 6: Message Pagination & Chronological Ordering
  console.log("\n6. Testing Pagination and Chronological Ordering...");
  // Simulate 10 messages
  for (let i = 4; i <= 10; i++) {
    mockSendMessage(conv1.id, i % 2 === 0 ? userB : userA, `Message #${i}`);
  }

  function mockGetMessages(conversationId, userId, limit = 5, before = null) {
    const conv = mockDb.conversations.find((c) => c.id === conversationId);
    if (!conv || (conv.userOneId !== userId && conv.userTwoId !== userId)) {
      const err = new Error("Forbidden");
      err.statusCode = 403;
      throw err;
    }

    let all = mockDb.messages.filter((m) => m.conversationId === conversationId);
    if (before) {
      all = all.filter((m) => new Date(m.createdAt) < new Date(before));
    }

    // Sort desc to get latest first
    all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const page = all.slice(0, limit);
    const hasMore = all.length > limit;

    // Chronological output (oldest to newest)
    page.reverse();
    return { messages: page, hasMore };
  }

  const batch1 = mockGetMessages(conv1.id, userA, 5);
  assert(batch1.messages.length === 5, "Batch 1 returned exactly 5 messages");
  assert(batch1.hasMore === true, "Batch 1 correctly reports hasMore: true");
  assert(
    batch1.messages[0].content === "Message #6" && batch1.messages[4].content === "Message #10",
    "Batch 1 is sorted in ascending chronological order (Message #6 -> Message #10)"
  );

  // Fetch older messages using before timestamp of batch1[0]
  const batch2 = mockGetMessages(conv1.id, userA, 5, batch1.messages[0].createdAt);
  assert(batch2.messages.length === 5, "Batch 2 returned older 5 messages");
  assert(
    batch2.messages[0].content === "Hello Bob!" && batch2.messages[4].content === "Message #5",
    "Batch 2 correctly fetches older history in chronological order (Hello Bob! -> Message #5)"
  );

  console.log("\n=================================================");
  console.log(`RESULTS: ${passed} / ${total} tests passed!`);
  console.log("=================================================\n");

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runMember2UnitTests();
