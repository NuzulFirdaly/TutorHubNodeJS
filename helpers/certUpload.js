const multer = require("multer");
const path = require('path');


//profilepicture
const storageForUploads = multer.diskStorage({
    destination: './public/pendingcerts',
    filename: function(req, file, cb) { //cb is a callback function (null, destination string)
        cb(null,req.user.user_id +'-'+ file.fieldname + '-' + Date.now() + path.extname(file.originalname))//callback(err, ) we dont want error so we just put null
    }
});

//Init upload
const upload  = multer({
    storage: storageForUploads,
    limits: {fileSize:  10000000},
    fileFilter: function(req,file,cb){
        checkFileType(file, cb);
    }
}).single('profilePictureUpload')

function checkFileType(file, cb){
    //Allowed ext
    const filetypes =  /doc|docx|odt|pdf/; //reqex
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());//test the file ext on all the allowed file types
  
    const mimetype = filetypes.test(file.mimetype);
  
    if(mimetype && extname){
        return cb(null,true);
    } else{
        cb('Accepted file types: pdf, doc or docx')
    }
  
};


module.exports = upload;