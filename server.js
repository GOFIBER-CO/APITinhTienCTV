const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const fileUpload = require("express-fileupload");
const cron = require("node-cron");
const userRoutes = require("./routers/user.router");
const ROLE = require("./helpers/role");
const domainRoutes = require("./routers/domain.router");
const fpRouter = require("./routers/fp.router");
const linkManagementRouter = require("./routers/linkManagement.router");
const brandRouter = require("./routers/brand.router");
const collaboratorRouter = require("./routers/collaborator.router");
const roleRouter = require("./routers/role.router");
const teamRouter = require("./routers/team.router");
const orderPostsRouter = require("./routers/orderPosts.router");
var origin_urls;
if (process.env.NODE_ENV == "development") {
  origin_urls = [
    `${process.env.CLIENT_DEV_URL}`,
    `${process.env.ADMIN_DEV_URL}`,
  ];
} else if (process.env.NODE_ENV == "production") {
  origin_urls = [`${process.env.CLIENT_URL}`, `${process.env.ADMIN_URL}`];
}

const corsOptions = {
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "X-Access-Token",
    "Authorization",
  ],
  credentials: true,
  methods: "GET, HEAD, OPTIONS, PUT, PATCH, POST, DELETE",
  origin: origin_urls,
  preflightContinue: false,
};

//app
const app = express();
// app.use('/swagger', require('./helpers/swagger'))

//models
const Role = require("./models/role.model");
const User = require("./models/user.model");
//cors
app.use(cors(corsOptions));
app.use(fileUpload());
const server = require("http").createServer(app);
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}
// middlewares
app.use(morgan("dev"));
// app.use(bodyParser.json({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//db
mongoose.set("strictQuery", false);
mongoose.connect(process.env.DATABASE_CLOUD, function (err) {
  if (err) {
    console.log(err);
    console.log("Mongodb connected error");
  } else {
    console.log("Mongodb connected successfuly");
    initial();
  }
});

// port
const port = process.env.PORT || 8000;
const portServer = process.env.CLIENT_PORTSERVER || 8002;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

server.listen(portServer, () => {
  console.log(`Servers running at localhost:${portServer}`);
});

const portSocketIO = process.env.CLIENT_PORTSOCKETIO || 8003;

// const io = require("socket.io")(portSocketIO);

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});
// io.on("connection", (socket) => {
//   console.log("a user connected" + socket.id);
// });

app.use("/api", userRoutes);
app.use("/api", domainRoutes);
app.use("/api", fpRouter);
app.use("/api", linkManagementRouter);
app.use("/api", brandRouter);
app.use("/api", collaboratorRouter);
app.use("/api", roleRouter);
app.use("/api", teamRouter);
app.use("/api", orderPostsRouter);

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "Admin",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'Admin' to roles collection");
      });

      new Role({
        name: "Leader",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'Leader' to roles collection");
      });

      new Role({
        name: "Member",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'Member' to roles collection");
      });
    }
  });

  User.estimatedDocumentCount((err, count) => {
    if (!err && count == 0) {
      new User({
        firstName: "Test",
        lastName: "Test",
        username: "admin",
        passwordHash: bcrypt.hashSync("123123", 10),
        role: ROLE.Admin,
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("add user admin");
      });
      new User({
        firstName: "Cộng tác viên",
        lastName: "",
        username: "ctvseo123",
        passwordHash: bcrypt.hashSync("123123", 10),
        role: ROLE.Collaborators,
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("add user Collaborators");
      });
      new User({
        firstName: "Biên tập viên",
        lastName: "",
        username: "btvseo123",
        passwordHash: bcrypt.hashSync("123123", 10),
        role: ROLE.Editor,
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("add user Editor");
      });
    }
  });
}
initial;
cron.schedule(
  "* * * * *",
  () => {
    console.log("Running a job at 01:00 at America/Sao_Paulo timezone");
  },
  {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh",
  }
);
