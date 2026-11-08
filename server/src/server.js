require("dotenv").config();

const prisma = require("./config/prisma");
const app = require("./app");

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("PostgreSQL connected successfully through Prisma!");

    const server = app.listen(PORT, () => {
      console.log(`KNOT server running on port ${PORT}`);
    });

    server.ref();

    server.on("error", (error) => {
      console.error("Server error:", error);
    });

    server.on("close", () => {
      console.log("HTTP server closed");
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();