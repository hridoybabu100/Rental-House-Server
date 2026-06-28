const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const logger = (req, res, next) => {
  console.log("The logger is a", req.params);
  next();
};

const uri = process.env.MOONGO_DB_DATA_BASE;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const db = client.db("House_DB");
    const organizationCollection = db.collection("organizations");
    const eventsCollection = db.collection("events");
    const usersCollection = db.collection("user");
    const bookingCollection = db.collection("bookings");
    const paymentCollection = db.collection("payments");
    const sessionCollection = db.collection("session");

    //Verify Token & midaleware
    const verifyToken = async (req, res, next) => {
      // console.log("Backend Headers", req.headers);
      const authHeader = req.headers?.authorization;
      if (!authHeader) {
        return res.status(404).send({ message: "Unauthorized access" });
      }
      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(404).send({ message: "Unauthorized access" });
      }

      const query = { token: token };
      const session = await sessionCollection.findOne(query);
      // console.log('The session', session);

      const userId = session?.userId;
      // console.log("User Id", userId);

      const userQuery = {
        _id: userId,
      };

      const user = await usersCollection.findOne(userQuery);
      // console.log('The user is a', user);
      req.user = user;

      next(); // <-- you were missing this; without it every request using this middleware hangs forever
    };

    

    app.get("/", (req, res) => {
      res.send("Hello tenant house building!");
    });

    // --- Organization routes ---
    app.get("/api/organization/:email", async (req, res) => {
      const { email } = req.params;
      const result = await organizationCollection.findOne({
        organizerEmail: email,
      });
      res.send(result);
    });

    app.post("/api/organizations", async (req, res) => {
      const { organizationName, logo, website, description, organizerEmail } =
        req.body;

      const addData = {
        organizationName,
        logo,
        website,
        description,
        organizerEmail,
        createdAt: new Date(),
        status: "active",
      };

      const result = await organizationCollection.insertOne(addData);
      res.send(result);
    });

    app.patch("/api/organizations/:id", async (req, res) => {
      const { id } = req.params;
      const { organizationName, logo, website, description, organizerEmail } =
        req.body;

      const updateData = {
        organizationName,
        logo,
        website,
        description,
        organizerEmail,
      };

      const result = await organizationCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...updateData } },
      );

      res.send(result);
    });

    // --- Events routes ---
    app.get("/api/events", async (req, res) => {
      const search = req.query.search;
      const category = req.query.category;
      const location = req.query.location;
      const query = {};
      if (search) {
        query.title = { $regex: search, $options: "i" };
      }
      if (category) {
        query.category = { $in: category.split(",") };
      }
      if (location) {
        query.location = location;
      }

      const cursor = eventsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
   

    app.get("/api/events/:email", verifyToken, logger, async (req, res) => {
      const { email } = req.params;
      const result = await eventsCollection
        .find({ organizationEmail: email })
        .toArray();
      res.send(result);
    });

    

    app.get("/api/single-events/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await eventsCollection.findOne(query);
      res.send(result);
    });

    app.post("/api/events", async (req, res) => {
      const data = req.body;
      const organizer = await usersCollection.findOne({
        email: data?.organizationEmail,
      });
      const organizerEventsCounts = await eventsCollection.countDocuments({
        organizationEmail: data?.organizationEmail,
      });

      if (!organizer?.isPremium && organizerEventsCounts >= 10) {
        return res.status(401).send({
          message: "Your free limit is over",
        });
      }

      const result = await eventsCollection.insertOne({
        ...data,
        status: "pending",
      });

      res.send(result);
    });

    app.patch("/api/events/:id", async (req, res) => {
      const { id } = req.params;
      const updateData = req.body;

      const result = await eventsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...updateData } },
      );

      res.send(result);
    });

    app.delete("/api/events/:id", async (req, res) => {
      const { id } = req.params;
      const result = await eventsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // --- Bookings routes ---
    app.get("/api/events/booking/:email",async (req, res) => {
      const { email } = req.params;
      const result = await bookingCollection
        .find({ attendeeEmail: email })
        .toArray();
      res.send(result);
    });

    app.post("/api/events/booking", async (req, res) => {
      const {
        amount,
        evetId,
        eventTitle,
        quantity,
        email,
        paymentType,
        transactionId,
        paymentStatus,
      } = req.body;

      const bookingData = {
        evetId,
        eventTitle,
        attendeeEmail: email,
        quantity,
        amount,
        transactionId,
        paymentStatus,
        bookingDate: new Date(),
      };

      const isBookingExist = await bookingCollection.findOne({ transactionId });
      if (isBookingExist) {
        return res.status(200).send({ message: "Already paid" });
      }

      const bookingRes = await bookingCollection.insertOne(bookingData);

      await eventsCollection.updateOne(
        { _id: new ObjectId(evetId) },
        { $inc: { capacity: -quantity } },
      );

      const paymentData = {
        userEmail: email,
        amount,
        transactionId,
        paymentStatus,
        paymentType,
        paidAt: new Date(),
      };

      await paymentCollection.insertOne(paymentData);
      res.send(bookingRes);
    });

    // --- Premium / payment routes ---
    app.patch("/api/users/upgrade-premium/:email", async (req, res) => {
      const { email } = req.params;
      const { amount, transactionId, paymentStatus, paymentType } = req.body;

      const result = await usersCollection.updateOne(
        { email },
        { $set: { isPremium: true } },
      );

      const paymentData = {
        userEmail: email,
        amount,
        transactionId,
        paymentStatus,
        paymentType,
        paidAt: new Date(),
      };

      await paymentCollection.insertOne(paymentData);

      res.send(result);
    });

    app.get("/api/payment/:email", async (req, res) => {
      const { email } = req.params;
      const result = await paymentCollection
        .find({ userEmail: email })
        .toArray();
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// module.exports = app;
