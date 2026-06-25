const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MOONGO_DB_DATA_BASE;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// async function run() {
//   try {

//     await client.connect();

client
  .connect(() => {
    console.log("Conneted to Mongo DB uri");
  })
  .catch(console.dir);

const db = client.db("House_DB");
const organizationCollection = db.collection("organizations");
const eventsCollection = db.collection("events");
const usersCollection = db.collection("user");
const bookingCollection = db.collection("bookings");
const paymentCollection = db.collection("payments");



const usersCollection = db.collection("users");
const propertiesCollection = db.collection("properties");
const bookingsCollection = db.collection("bookings");
const paymentsCollection = db.collection("payments");

//Organization get post
app.get("/api/organization/:email", async (req, res) => {
  const { email } = req.params;
  const result = await organizationCollection.findOne({
    organizerEmail: email,
  });
  res.send(result);
});
//Organization post
app.post("/api/organizations", async (req, res) => {
  console.log(req.body);
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

//Orzanization patch updated data
app.patch("/api/organizations/:id", async (req, res) => {
  const { id } = req.params;

  const { organizationName, logo, website, description, organizerEmail } =
    req.body;
  console.log(organizationName, logo, website, description, organizerEmail, id);

  const updateData = {
    organizationName,
    logo,
    website,
    description,
    organizerEmail,
  };

  const result = await organizationCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...updateData,
      },
    },
  );

  res.send(result);
});

//Property add
app.post("/api/events", async (req, res) => {
  const data = req.body;
  // console.log(data);
  const organizer = await usersCollection.findOne({
    email: data?.organizationEmail,
  });
  const organizerEventsCounts = await eventsCollection.countDocuments({
    organizationEmail: data?.organizationEmail,
  });

  // api events email
  app.get("/api/events/:email", async (req, res) => {
    const { email } = req.params;
    // console.log(email);
    const result = await eventsCollection
      .find({ organizationEmail: email })
      .toArray();
    res.send(result);
  });

  app.get("/api/events/booking/:email", async (req, res) => {
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
    // console.log(req.body);
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
      {
        $inc: {
          capacity: -quantity,
        },
      },
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

  app.post("/api/events", async (req, res) => {
    const data = req.body;
    // console.log(data);
    const organizer = await usersCollection.findOne({
      email: data?.organizationEmail,
    });
    const organizerEventsCounts = await eventsCollection.countDocuments({
      organizationEmail: data?.organizationEmail,
    });
    // console.log(organizerEventsCounts);

    if (!organizer?.isPremium && organizerEventsCounts >= 10) {
      return res.status(401).send({
        message: "Your free limit is over",
      });
    }
    const result = await eventsCollection.insertOne({
      ...data,
      status: "pending",
    });
    // console.log(result);

    res.send(result);
  });

  app.delete("/api/events/:id", async (req, res) => {
    const { id } = req.params;
    const result = await eventsCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  });

  app.patch("/api/events/:id", async (req, res) => {
    // console.log(req.body);
    const { id } = req.params;

    const updateData = req.body;

    const result = await eventsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
        },
      },
    );
    // console.log(result);

    res.send(result);
  });

  app.get("/api/events", async (req, res) => {
    const search = req.query.search;
    const category = req.query.category;
    const location = req.query.location;
    const query = {};
    if (search) {
      query.title = {
        $regex: search,
        $options: "i",
      };
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

  app.get("/api/single-events/:id", async (req, res) => {
    const { id } = req.params;
    const query = { _id: new ObjectId(id) };
    const result = await eventsCollection.findOne(query);
    res.send(result);
  });

  // console.log(organizerEventsCounts);

  if (!organizer?.isPremium && organizerEventsCounts >= 10) {
    return res.status(401).send({
      message: "Your free limit is over",
    });
  }
  const result = await eventsCollection.insertOne({
    ...data,
    status: "pending",
  });
  // console.log(result);

  res.send(result);
});

//All events gula ke pawar jonne.

app.get("/api/events", async (req, res) => {
  const cursor = await eventsCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});
app.get("/api/events/featured", async (req, res) => {
  const cursor = await eventsCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});

//Patch
app.patch("/api/events/:id", async (req, res) => {
  // console.log(req.body);
  const { id } = req.params;

  const updateData = req.body;

  const result = await eventsCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...updateData,
      },
    },
  );
  // console.log(result);

  res.send(result);
});

app.get("/api/single-events/:id", async (req, res) => {
  const { id } = req.params;
  const query = { _id: new ObjectId(id) };
  const result = await eventsCollection.findOne(query);
  res.send(result);
});

//Primium upgrade
app.patch("/api/users/upgrade-premium/:email", async (req, res) => {
  const { email } = req.params;
  const { amount, transactionId, paymentStatus, paymentType } = req.body;

  const result = await usersCollection.updateOne(
    { email },
    {
      $set: {
        isPremium: true,
      },
    },
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
  console.log(email);

  const result = await paymentCollection.find({ userEmail: email }).toArray();
  res.send(result);
});



// backend

app.get("/api/admin/overview", async (req, res) => {
  try {
    // =========================
    // COLLECTIONS
    // =========================
    // ধরে নিচ্ছি এগুলো already আছে
    // usersCollection
    // propertiesCollection
    // bookingsCollection
    // paymentsCollection

    // =========================
    // TOTAL USERS
    // =========================
    const totalUsers = await usersCollection.countDocuments({
      role: "user",
    });

    // =========================
    // TOTAL OWNERS
    // =========================
    const totalOwners = await usersCollection.countDocuments({
      role: "owner",
    });

    // =========================
    // TOTAL BOOKINGS
    // =========================
    const totalBookings = await bookingsCollection.countDocuments();

    // =========================
    // TOTAL REVENUE
    // =========================
    const revenueResult = await paymentsCollection
      .aggregate([
        {
          $match: {
            status: "paid",
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amount" },
          },
        },
      ])
      .toArray();

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // =========================
    // MONTHLY EARNINGS (Current Year)
    // =========================
    const currentYear = new Date().getFullYear();

    const monthlyRevenue = await paymentsCollection
      .aggregate([
        {
          $match: {
            status: "paid",
            paidAt: {
              $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
              $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$paidAt" },
            earnings: { $sum: "$amount" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray();

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyEarnings = monthNames.map((month, index) => {
      const found = monthlyRevenue.find((item) => item._id === index + 1);

      return {
        month,
        earnings: found?.earnings || 0,
      };
    });

    // =========================
    // FINAL RESPONSE
    // =========================
    res.send({
      success: true,
      overview: {
        totalRevenue,
        totalUsers,
        totalOwners,
        totalBookings,
        monthlyEarnings,
      },
    });
  } catch (error) {
    console.error("Admin overview API error:", error);
    res.status(500).send({
      success: false,
      message: "Failed to load admin overview data",
      error: error.message,
    });
  }
});

// tranjeection api
// =========================
// ADMIN TRANSACTIONS API
// =========================
app.get("/api/admin/transactions", async (req, res) => {
  try {
    const { search = "", status = "all", method = "all" } = req.query;

    const query = {};

    // status filter
    if (status && status !== "all") {
      query.status = status.toLowerCase();
    }

    // payment method filter
    if (method && method !== "all") {
      query.paymentMethod = method.toLowerCase();
    }

    // search filter
    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: "i" } },
        { invoiceId: { $regex: search, $options: "i" } },
        { buyerName: { $regex: search, $options: "i" } },
        { buyerEmail: { $regex: search, $options: "i" } },
        { propertyTitle: { $regex: search, $options: "i" } },
      ];
    }

    const transactions = await paymentsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // summary হিসাব
    const totalTransactions = transactions.length;
    const totalRevenue = transactions.reduce(
      (sum, item) => sum + Number(item?.amount || 0),
      0
    );

    const paidTransactions = transactions.filter(
      (item) => item?.status?.toLowerCase() === "paid"
    ).length;

    const pendingTransactions = transactions.filter(
      (item) => item?.status?.toLowerCase() === "pending"
    ).length;

    res.send({
      success: true,
      summary: {
        totalTransactions,
        totalRevenue,
        paidTransactions,
        pendingTransactions,
      },
      transactions,
    });
  } catch (error) {
    console.error("Admin transactions fetch error:", error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch admin transactions",
      error: error.message,
    });
  }
});


const { ObjectId } = require("mongodb");

app.patch("/api/payments/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { status, paymentMethod } = req.body;

    const updateDoc = {
      $set: {
        ...(status && { status: status.toLowerCase() }),
        ...(paymentMethod && { paymentMethod: paymentMethod.toLowerCase() }),
      },
    };

    if (status?.toLowerCase() === "paid") {
      updateDoc.$set.paidAt = new Date();
    }

    const result = await paymentsCollection.updateOne(
      { _id: new ObjectId(id) },
      updateDoc
    );

    res.send({
      success: true,
      message: "Payment updated successfully",
      result,
    });
  } catch (error) {
    console.error("Update payment error:", error);
    res.status(500).send({
      success: false,
      message: "Failed to update payment",
      error: error.message,
    });
  }
});


// Send a ping to confirm a successful connection
// await client.db("admin").command({ ping: 1 });
// "Pinged your deployment. You successfully connected to MongoDB!",
//     console.log(
//     );
//   } finally {

//   }
// }
// run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello tenant house building!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
