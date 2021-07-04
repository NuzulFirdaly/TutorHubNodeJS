const express = require('express');
const session = require('express-session');
const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser'); //to retrieve req.body
const Sequelize = require('sequelize');

const Handlebars = require('handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')



// Messaging Libraries
const flash = require('connect-flash');
const FlashMessenger = require('flash-messenger');


const passport = require('passport')


//Routes
const mainRoute = require('./routes/main');
const tutorOnboardingRoute = require('./routes/tutor_onboarding');
const courseRoute = require("./routes/course");
const scheduleRoute = require("./routes/schedule");
const userRoute = require("./routes/user");
const shopRoute = require("./routes/shop");
const rateRoute = require("./routes/ratereview");
const mainInstitutionRoute = require('./routes/maininstitution');
const institutionAdminRoute = require('./routes/institutionadmin');
const adminRoute = require("./routes/admin");



//mysql init
const tutorhubDB = require('./config/DBConnection');
tutorhubDB.setUpDB(false) //notice that to use setupDB we need to type vidjotDB and access its methods, we get this by exporting the module with {}
const MySQLStore = require('express-mysql-session');
const db = require('./config/db'); // db.js config file for session


// Passport Config
const authenticate = require('./config/passport');

authenticate.localStrategy(passport);

//App
var app = express();
//MiddleWares
// Body parser middleware to parse HTTP body in order to read HTTP data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// HandleBar middlewares
app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    helpers: {
        loopcourse: function(value, options) {
            return options.fn({ test: value })
        },
        ifEquals(a, b, options) {
            // console.log("helper function")
            // console.log(a)
            // console.log(b)
            if (a == b) {
                // console.log("Printing ifEquals helper")
                // console.log(this)
                return options.fn(this)
            } else {
                return options.inverse(this) //hide this
            }
        },
        ifSame(a, b) {
            return a == b
        },
        format(date) {
            dateParsed = new Date(Date.parse(date));
            // return `${dateParsed.getFullYear()} - ${(dateParsed.getMonth() + 1)} - ${dateParsed.getDate()}`
            return dateParsed
        },
        ifNotEquals(a, b) {
            return a != b;
        },
        forloop(from, to, incr, block) {
            var accum = ''
            for (var i = from; i < to; i += incr) {
                block.data.index = i;
                accum += block.fn(i);
            }
            return accum;
        },
        ifInBetween(a, b, c) {
            return a >= b && a <= c;
        },
        ifGreater(a,b){
            return a>b;
        }

    },
    handlebars: allowInsecurePrototypeAccess(Handlebars)
}));
app.set('view engine', 'handlebars');



// Creates static folder for publicly accessible HTML, CSS and Javascript files
app.use(express.static(path.join(__dirname, 'public'))); // serve images, CSS files, and JavaScript files in a directory named public

app.use(methodOverride('_method'));

// Enables session to be stored using browser's Cookie ID
app.use(cookieParser());

// Express session middleware - uses MySQL to store session
app.use(session({
    key: 'tutorhub_session',
    secret: 'nuzulfirdaly',
    store: new MySQLStore({
        host: db.host,
        port: 3306,
        user: db.username,
        password: db.password,
        database: db.database,
        clearExpired: true,
        // How frequently expired sessions will be cleared; milliseconds:
        checkExpirationInterval: 900000,
        // The maximum age of a valid session; milliseconds:
        expiration: 900000,
    }),
    resave: false,
    saveUninitialized: false
}));


//All this middleware functions needs session to store it in

// Initilize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Flash Middleware
app.use(flash());
app.use(FlashMessenger.middleware);
//WAS MISSING THIS WHAT IS THIS
app.use(function(req, res, next) {
    // console.log("THHIS is fuCking local")
    // console.log("savnig to local")

    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    if (req.user) {
        res.locals.user = req.user.dataValues;
    }
    //setup framework
    next();
});
// Place to define global variables - not used in practical 1
// app.use(function (req, res, next) {
// 	next();
// });



//Routes
app.use("/", mainRoute); // mainRoute is declared to point to routes/main.js
app.use('/tutor_onboarding', tutorOnboardingRoute);
app.use("/course", courseRoute);
app.use("/myschedule", scheduleRoute);
app.use("/user", userRoute);
app.use("/shop", shopRoute);
app.use("/rate", rateRoute);

app.use("/institution", mainInstitutionRoute)
app.use("/institution_admin", institutionAdminRoute);

app.use("/admin", adminRoute)


// // Method override middleware to use other HTTP methods such as PUT and DELETE
// app.use(methodOverride('_method'));


app.set('port', (process.env.PORT || 3000));



//Initializing app with this port number
app.listen(app.get('port'), function() {
    console.log(`Server started on port ${app.get('port')}`)
});